# Intergração Continua, DevOps e Computação em Nuvem
Projeto de disciplina de Intergração Continua, DevOps e Computação em Nuvem.

## Ambiente

### Docker

Acesse o link abaixo para baixar as seguintes imagens do docker:
* https://hub.docker.com/_/microsoft-mssql-server
* https://hub.docker.com/repository/docker/charlesmendes13/crud

Em seguida execute o seguinte comando para criar um container do SQL Server:

```
$ docker run --name sqlserver -e 'ACCEPT_EULA=Y' -e "SA_PASSWORD=Str0ngPa$$w0rd" -v /caminho/para/scripts_sql:/scripts_sql -p 1433:1433 -d mcr.microsoft.com/mssql/server
```

Agora vá até o diretório "/sql", e execute os seguintes comandos para copiar e executar o script de criação de banco e tabela:

```
$ docker cp produto.sql d51d2c14826b:/produto.sql
$ docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Str0ngPa$$w0rd -i /produto.sql
```

Agora crie o container do projeto "crud"

```
$ docker run --name crud -e "SERVER=172.17.0.2" -e "PORT=1433" -e "DATABASE=crud" -e "USER=SA" -e "PASSWORD=Str0ngPa$$w0rd" -p 5001:443 -p 5000:80 -d charlesmendes13/crud
```

## Testes

Agora acesse o sistema no endereço http://localhost:5000 e realize as operações de CRUD dos Produtos.
