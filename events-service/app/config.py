from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    jwt_secret: str = "PROJECTS_SECRET"

    mysql_host: str = "events-db"
    mysql_db: str = "events_db"
    mysql_user: str = "root"
    mysql_password: str = "root"

    class Config:
        env_prefix = ""


settings = Settings()
