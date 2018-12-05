Scaffolded from [this tutorial](https://www.fullstackreact.com/articles/how-to-get-create-react-app-to-work-with-your-rails-api/).

# Setup

[Install Postgres](https://www.postgresql.org/download/windows/), then create a `config/application.yml` file like this one:

```
development:
  db_username: postgres
  db_password: admin
```

# Development

Start Rails and React servers with `rake start`.
