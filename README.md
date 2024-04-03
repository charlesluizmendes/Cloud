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
docker run --name sqlserver -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=Str0ngPa$$w0rd' -p 1433:1433 -d mcr.microsoft.com/azure-sql-edge
```

Agora crie o container do projeto "crud"

```
docker run --name crud -e "SERVER=localhost" -e "PORT=1433" -e "DATABASE=crud" -e "USER=SA" -e "PASSWORD=Str0ngPa$$w0rd" -p 5001:80 -d charlesmendes13/crud
```

## Testes

Agora acesse o sistema no endereço http://localhost:5000 e realize as operações de CRUD dos Produtos.
