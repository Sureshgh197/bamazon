demo e-com app using django rest

Phase 1: SSH Key Setup (Control Node → App Servers)
On your GCP DevOps server:

# Generate SSH key if not exists
ssh-keygen -t ed25519 -C "jenkins-deploy" -f ~/.ssh/deploy_key -N ""

# Copy public key to each app server
ssh-copy-id -i ~/.ssh/deploy_key.pub user@app-server-1
ssh-copy-id -i ~/.ssh/deploy_key.pub user@app-server-2
# repeat for all app servers
Phase 2: Ansible Configuration
1. Create inventory file (/etc/ansible/hosts or custom location):

[webservers]
app-server-1 ansible_host=10.0.0.10
app-server-2 ansible_host=10.0.0.11

[dbservers]
db-server-1 ansible_host=10.0.0.20

[all:vars]
ansible_user=deploy
ansible_ssh_private_key_file=/var/lib/jenkins/.ssh/deploy_key
ansible_python_interpreter=/usr/bin/python3
2. Create Ansible playbook (
deploy-app.yml
):

---
- name: Deploy Application
  hosts: webservers
  become: yes
  vars:
    app_name: myapp
    app_dir: /opt/{{ app_name }}
    repo_url: "{{ git_repo }}"
    branch: "{{ git_branch | default('main') }}"

  tasks:
    - name: Pull latest code
      git:
        repo: "{{ repo_url }}"
        dest: "{{ app_dir }}"
        version: "{{ branch }}"
        force: yes

    - name: Install dependencies
      command: npm install --production
      args:
        chdir: "{{ app_dir }}"

    - name: Restart application
      systemd:
        name: "{{ app_name }}"
        state: restarted
        enabled: yes

  handlers:
    - name: reload nginx
      systemd:
        name: nginx
        state: reloaded
3. Test Ansible connectivity:

ansible all -m ping
Phase 3: Jenkins Configuration
1. Install required Jenkins plugins:

Ansible Plugin
Git Plugin
Pipeline Plugin
Credentials Plugin
2. Configure credentials in Jenkins:

Go to: Manage Jenkins → Credentials → System → Global credentials
Add SSH private key for app servers
Add Git credentials (if private repo)
3. Configure Ansible in Jenkins:

Go to: Manage Jenkins → Tools → Ansible installations
Add Ansible path: /usr/bin/ansible
4. Create Jenkins Pipeline (Jenkinsfile):

pipeline {
    agent any
    
    environment {
        ANSIBLE_HOST_KEY_CHECKING = 'False'
        GIT_REPO = 'https://github.com/your-org/your-app.git'
    }
    
    parameters {
        choice(name: 'ENVIRONMENT', choices: ['staging', 'production'], description: 'Target environment')
        string(name: 'BRANCH', defaultValue: 'main', description: 'Git branch to deploy')
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: "${params.BRANCH}", url: "${GIT_REPO}"
            }
        }
        
        stage('Build & Test') {
            steps {
                sh '''
                    npm install
                    npm run test
                    npm run build
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                ansiblePlaybook(
                    playbook: '/opt/ansible/playbooks/deploy-app.yml',
                    inventory: "/opt/ansible/inventory/${params.ENVIRONMENT}",
                    credentialsId: 'ansible-ssh-key',
                    extras: "-e git_repo=${GIT_REPO} -e git_branch=${params.BRANCH}"
                )
            }
        }
        
        stage('Health Check') {
            steps {
                sh '''
                    sleep 10
                    curl -f http://app-server-1/health || exit 1
                '''
            }
        }
    }
    
    post {
        success {
            echo "Deployment successful!"
        }
        failure {
            echo "Deployment failed!"
            // Add notification (Slack, email, etc.)
        }
    }
}
Phase 4: Directory Structure
/opt/ansible/
├── ansible.cfg
├── inventory/
│   ├── staging
│   └── production
├── playbooks/
│   ├── deploy-app.yml
│   ├── rollback.yml
│   └── health-check.yml
├── roles/
│   └── app-deploy/
│       ├── tasks/
│       ├── handlers/
│       └── templates/
└── group_vars/
    ├── staging.yml
    └── production.yml
Phase 5: Webhook for Auto-Trigger
GitHub/GitLab webhook setup:

In Jenkins: Create job → Build Triggers → "GitHub hook trigger for GITScm polling"
In GitHub: Settings → Webhooks → Add webhook
URL: http://your-jenkins-server:8080/github-webhook/
Content type: application/json
Events: Push events
Phase 6: Security Hardening
# On DevOps server
# 1. Jenkins user should own ansible files
sudo chown -R jenkins:jenkins /opt/ansible

# 2. Restrict SSH key permissions
chmod 600 /var/lib/jenkins/.ssh/deploy_key

# 3. Use ansible-vault for secrets
ansible-vault create /opt/ansible/group_vars/vault.yml
Quick Checklist
Step	Task	Command to Verify
1	SSH keys distributed	ansible all -m ping
2	Ansible inventory configured	ansible-inventory --list
3	Playbook tested	ansible-playbook deploy.yml --check
4	Jenkins can run Ansible	Run test job
5	Webhook configured	Push code, check Jenkins
Would you like me to create any of these configuration files in your workspace, or elaborate on any specific step?