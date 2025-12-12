pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/natnanon03/Final.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose down || true'
                sh 'docker compose up -d'
                sh 'sleep 10'   // รอ API พร้อมก่อน health check
            }
        }

        stage('Health Check') {
            steps {
                sh 'curl -f http://localhost:3001/ || exit 1'
            }
        }
    }
}
