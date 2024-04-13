# Intergração Continua, DevOps e Computação em Nuvem
Projeto de disciplina de Intergração Continua, DevOps e Computação em Nuvem.

## Ambiente

### Docker

Acesse o link abaixo para baixar as seguintes imagens do docker:
* https://hub.docker.com/_/microsoft-mssql-server
* https://hub.docker.com/repository/docker/charlesmendes13/crud

Em seguida execute o seguinte comando para criar um container do SQL Server:

```
docker run --name sqlserver -e 'ACCEPT_EULA=Y' -e "SA_PASSWORD=Str0ngPa$$w0rd" -p 1433:1433 -d mcr.microsoft.com/mssql/server
```
<sup>ou para processadores ARM64:</sup>
```
docker run --name sqlserver --cap-add SYS_PTRACE -e 'ACCEPT_EULA=1' -e 'MSSQL_SA_PASSWORD=Str0ngPa$$w0rd' -p 1433:1433 -d mcr.microsoft.com/azure-sql-edge
```

Agora crie o container do projeto "crud":

```
docker run --name crud -e 'SERVER=<ip do container sqlserver>' -e 'PORT=1433' -e 'DATABASE=crud' -e 'USER=SA' -e 'PASSWORD=Str0ngPa$$w0rd' -p 5001:80 -d charlesmendes13/crud
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

## JMeter

Para executar os Testes de Carga, utilizaremos o JMeter como ferramenta para tal. Primeiramente vamos baixar esse arquivo [jmx](https://github.com/charlesmendes13/Kubernetes/blob/master/jmeter/crud.jmx). Feito isso vamos executar o JMeter no diretório onde o arquivo voi baixado.

```
jmeter -n -t crud.jmx -l crud-results.csv -e -o results/
```

## Jenkins

Agora vamos criar uma pipeline para compilação do projeto no Jenkins. Primeiramente você precisa realizar o download e instalação do [Java](https://www.oracle.com/br/java/technologies/javase/jdk11-archive-downloads.html), após isso vamos baixar esse arquivo [jenkins.war](https://get.jenkins.io/war-stable/2.440.2/jenkins.war) e ir até o diretório onde o arquivo se encontra e executar o seguinte comando:

```
java -jar jenkins.war --httpPort=9090
```

Feito isso, o jenkins irá ser instanciado, instale todos os plugins sugeridos e aguardade a finalização dos mesmos. Agora e so acessar o Jenkis no endereço http://localhost:9090 e criar a pipeline com as configurações do [arquivo](https://github.com/charlesmendes13/Kubernetes/blob/master/jenkins/pipeline.jenkinsfile). Após isso e somente executar a pipeline e o projeto Crud será compilado.
