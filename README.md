# proyecto-pasantias
## Descripción del Proyecto

Este es un Dashboard de Ventas interactivo desarrollado con Django, HTML, CSS y JavaScript. Permite visualizar información detallada sobre ventas, ganancias y variaciones por región y categoría. Incluye funcionalidades para filtrar datos y generar gráficos dinámicos, proporcionando una interfaz amigable y responsiva para el análisis de ventas.

## Tecnologías Utilizadas
-Backend: Django (Python)
-Frontend: HTML5, CSS3, JavaScript (ES6)
-Librerías:
    Chart.js para gráficos.
    Chart.js DataLabels para mostrar etiquetas en los gráficos.
-Base de Datos: MySQL (puede adaptarse a otras bases de datos compatibles con Django)

## Requisitos Previos
Asegúrate de tener instaladas las siguientes herramientas:

-Python 3.x
Descárgalo desde Python.org.

-Django

    pip install django

-MySQL
Puedes descargarlo desde MySQL Downloads.

-MySQL Connector para Python:

    pip install mysqlclient

## Instalación y Configuración

### **Clonar el Repositorio**
	> git clone https://github.com/kenethps2000/proyecto-pasantias.git 
	> cd dashboard-ventas

### **Activar el entorno virtual**
	> .\env\Scripts\activate

### **Configurar la Base de Datos**
Edita el archivo `settings.py` para configurar tu base de datos MySQL:
	
	DATABASES = {
	    'default': {
	        'ENGINE': 'django.db.backends.mysql',
	        'NAME': 'nombre_de_tu_bd',
	        'USER': 'tu_usuario',
	        'PASSWORD': 'tu_contraseña',
	        'HOST': 'localhost',
	        'PORT': '3306',
	    }
	}
recuerde tener una tabla llamada "orders"
### **Ejecutar el Servidor**
	python manage.py runserver
Accede a la aplicación en: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
