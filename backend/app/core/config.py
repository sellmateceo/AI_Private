from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Host Management"
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = "root"
    mysql_db: str = "host_management"
    secret_key: str = "change-this-secret"
    access_token_expire_minutes: int = 1440
    admin_username: str = "admin"
    admin_password: str = "admin123"
    admin_role: str = "admin"

    class Config:
        env_file = ".env"


settings = Settings()
