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
ou para processadores ARM64:
```
docker run --name sqlserver --cap-add SYS_PTRACE -e 'ACCEPT_EULA=1' -e 'MSSQL_SA_PASSWORD=Str0ngPa$$w0rd' -p 1433:1433 -d mcr.microsoft.com/azure-sql-edge
```

Agora crie o container do projeto "crud"

```
docker run --name crud -e 'SERVER=<ip do container sqlserver>' -e 'PORT=1433' -e 'DATABASE=crud' -e 'USER=SA' -e 'PASSWORD=Str0ngPa$$w0rd' -p 5001:80 -d charlesmendes13/crud
```
<sup>* Altere o '<ip do container sqlserver>' executando o comando docker inspect <id do container></sup>

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
<sup>* Altere o '<ip do container Crud>' executando o comando docker inspect <id do container></sup>

```
docker volume create prometheus-data
docker run -p 9090:9090 -v /path/to/file/prometheus.yml:/etc/prometheus/prometheus.yml -v prometheus-data:/prometheus -d prom/prometheus
```

## Testes

Agora acesse o sistema no endereço http://localhost:5001 e realize as operações de CRUD dos Produtos.
