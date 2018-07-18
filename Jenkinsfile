pipeline {
    agent any

    environment {
        IMAGE = 'mama-ng-jsbox:test-jenkins'
    }

    stages {
       stage('Build'){
           steps {
                sh 'docker build -t ${REGISTRY_URL}/${IMAGE} .'
           }
       }

       stage('Push'){
           steps {
                echo 'Push to Repo'
                sh 'docker push ${REGISTRY_URL}/${IMAGE}'
           }
       }
    }
}
