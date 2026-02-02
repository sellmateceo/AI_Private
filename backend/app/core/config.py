from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Host Management"
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = "root"
    mysql_db: str = "host_management"

    class Config:
        env_file = ".env"


settings = Settings()
