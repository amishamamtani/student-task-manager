
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/amishamamtani/student-task-manager.git'
            }
        }

        stage('Check Environment') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build Verification') {
            steps {
                sh 'node --check server.js'
                sh 'echo "Build verification completed"'
            }
        }
    }
}
