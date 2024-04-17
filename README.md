# Intergração Continua, DevOps e Computação em Nuvem
Projeto de disciplina de Intergração Continua, DevOps e Computação em Nuvem.

## Ambiente

### Docker

Acesse o link abaixo para baixar as seguintes imagens do docker:
* https://hub.docker.com/_/microsoft-mssql-server
* https://hub.docker.com/repository/docker/charlesmendes13/crud

Em seguida execute o seguinte comando para criar um container do SQL Server:

```
docker run --name sqlserver -e 'ACCEPT_EULA=Y' -e "SA_PASSWORD=Str0ngPassw0rd123!" -p 1433:1433 -d mcr.microsoft.com/mssql/server
```
<sup>ou para processadores ARM64:</sup>
```
docker run --name sqlserver --cap-add SYS_PTRACE -e 'ACCEPT_EULA=1' -e 'MSSQL_SA_PASSWORD=Str0ngPassw0rd123!' -p 1433:1433 -d mcr.microsoft.com/azure-sql-edge
```

Agora crie o container do projeto "crud":

```
docker run --name crud -e 'SERVER=<ip do container sqlserver>' -e 'PORT=1433' -e 'DATABASE=crud' -e 'USER=SA' -e 'PASSWORD=Str0ngPassw0rd123!' -p 5001:80 -d charlesmendes13/crud
```
<sup>* Altere o "ip do container sqlserver" executando o comando docker inspect <id do container></sup>

Em seguida podemos executar o Prometheus para criar um banco de metricas, baseado no arquivo 'prometheus.yml':

```
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "crud"
    metrics_path: "/metrics"
    scrape_interval: 3s
    static_configs:
    - targets: ["<ip do container Crud>:80"]
```
<sup>* Altere o "ip do container Crud" executando o comando docker inspect <id do container></sup>

```
docker volume create prometheus-data
docker run -p 9090:9090 -v /path/to/file/prometheus.yml:/etc/prometheus/prometheus.yml -v prometheus-data:/prometheus -d prom/prometheus
```

Agora vamos criar o Dashboard com o Grafana:

```
docker volume create grafana-data
docker run -d -v grafana-data:/var/lib/grafana -p 3000:3000 grafana/grafana
```

### Kubernetes

Primeiramente devemos instalar o Minikube atraves do link [minikube](https://minikube.sigs.k8s.io/docs/start/). Feito isso agora vamos iniciar o node com o comando;

```
minikube start
```

Agora vamos iniciar o dashboard do Kubernetes com o comando:

```
minikube dashboard
```

Feito isso agora podemos utilizar os arquivos de manifesto para criar os objetos do Kubernetes, baixando os arquivos contidos nesse [repositório](https://github.com/charlesmendes13/Cloud/tree/master/k8s) e executando os comandos abaixo:

- ConfigMaps [configs](https://github.com/charlesmendes13/Cloud/tree/master/k8s/configs):
```
kubectl apply -f jmeter.yml
kubectl apply -f prom.yml
```

- Roles [roles](https://github.com/charlesmendes13/Cloud/tree/master/k8s/roles):
```
kubectl apply -f prom.yml
```

- Volumes [volumes](https://github.com/charlesmendes13/Cloud/tree/master/k8s/volumes):
```
kubectl apply -f graf.yml
kubectl apply -f prom.yml
kubectl apply -f sql.yml
```

- Services [services](https://github.com/charlesmendes13/Cloud/tree/master/k8s/services):
```
kubectl apply -f app.yml
kubectl apply -f graf.yml
kubectl apply -f prom.yml
kubectl apply -f sql.yml
```

- Deployments [deployments](https://github.com/charlesmendes13/Cloud/tree/master/k8s/deployments):
```
kubectl apply -f app.yml
kubectl apply -f graf.yml
kubectl apply -f jmeter.yml
kubectl apply -f prom.yml
kubectl apply -f sql.yml
```

Criados todos os objetos no cluester agora podemos utilizar os comandos do minikube para criar a porta de acesso na nossa maquina local, utilizando os seguintes comandos:

```
minikube service crud-service
minikube service graf-service
```

Com isso podemos acessar a aplicação e utilizar todas as funcionalidades e acessar o painel do Grafana para obter as metricas do sistema.

## JMeter

Para executar os Testes de Carga, utilizaremos o JMeter como ferramenta para tal. Primeiramente vamos baixar esse arquivo [jmx](https://github.com/charlesmendes13/Cloud/blob/master/jmeter/crud.jmx). Feito isso vamos executar o JMeter no diretório onde o arquivo voi baixado.

```
jmeter -n -t crud.jmx -l crud-results.csv -e -o results/
```

Acessando o diretório onde foi executado o comando acima, podemos ir na pasta "results" e obter os resultados dos testes de carga. Também e possivel acessar o painel do Grafana e verificar os picos de utilização do sistema no momento da execução dos testes.

## Jenkins

Agora vamos criar uma pipeline para compilação do projeto no Jenkins. Primeiramente você precisa realizar o download e instalação do [Java](https://www.oracle.com/br/java/technologies/javase/jdk11-archive-downloads.html), após isso vamos baixar esse arquivo [jenkins.war](https://get.jenkins.io/war-stable/2.440.2/jenkins.war) e ir até o diretório onde o arquivo se encontra e executar o seguinte comando:

```
java -jar jenkins.war --httpPort=9090
```

Feito isso, o jenkins irá ser instanciado, instale todos os plugins sugeridos e aguardade a finalização dos mesmos. Agora e so acessar o Jenkis no endereço http://localhost:9090 e criar a pipeline com as configurações do [arquivo](https://github.com/charlesmendes13/Cloud/blob/master/jenkins/pipeline.jenkinsfile). Após isso e somente executar a pipeline e o projeto Crud será compilado.
