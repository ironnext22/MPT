# Aplikacja do tworzenia i udostępniania ankiet, głosowań

## Run project with docker compose

```
$ docker compose up
```

## Prepare ubuntu for playwright tests

```
$ sudo apt install x11-xserver-utils
$ xhost +local:docker
```

## Run frontend tests with playwright

```
$ docker compose run frontend_tests
```