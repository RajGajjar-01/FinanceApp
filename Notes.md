1. react-router not react-router-dom 
2. motion not framer-motion
3. Protected routes > https://github.com/idurar/idurar-erp-crm
4. Prettierrc banavani and configure krvani
5. input field changes. 

cd frontend > npm run dev

new terminal > 
cd backend

first time ? uv sync

db change > python migration commands 

python manage.py runserver.

new terminal > 
redis://localhost:6379 -- docker container of redis on lh 6379
docker start <container-name>

terminal> celery -A backend worker --loglevel=info

### **Docker Port Mapping**

- **"HOST_PORT:CONTAINER_PORT"**

    * First number (5432): Port on your local machine/host
    * Second number (5432): Port inside the container 


### **Commands to run Docker Compose**

- **Navigate to your project root**
`cd your-project/`

- **Start the database services**
`docker-compose up -d`

- **Check service status**
`docker-compose ps`

- **View logs**
`docker-compose logs -f`

- **Stop services**
`docker-compose down`

python manage.py runscript filename   .py nai

eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519