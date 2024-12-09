from django.db import connection
from django.http import JsonResponse
from django.shortcuts import render

def frontend(request):
    return render(request, 'frontend.html')

def filtros(request):
    # Obtener parámetros de filtro desde la URL
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    category = request.GET.get('category')

    # Consulta SQL con filtros dinámicos
    sql_query = """
        SELECT category, SUM(sales) as total_sales
        FROM orders
        WHERE order_date BETWEEN %s AND %s
    """
    params = [start_date, end_date]

    if category:
        sql_query += " AND category = %s"
        params.append(category)

    sql_query += " GROUP BY category ORDER BY total_sales DESC"

    # Ejecutar consulta SQL
    with connection.cursor() as cursor:
        cursor.execute(sql_query, params)
        rows = cursor.fetchall()

    # Preparar los datos para la respuesta JSON
    data = [{"category": row[0], "total_sales": row[1]} for row in rows]
    return JsonResponse(data, safe=False)

def top10(request):
    category = request.GET.get('category')
    year = request.GET.get('year')
    
    # Consulta base con el cálculo de porcentaje de ganancia
    sql_query = """SELECT 
                       Customer_Name, 
                       city, 
                       SUM(sales) AS total_sales, 
                       ROUND(SUM(profit),2) AS total_profit,
                       ROUND(((SUM(profit) / NULLIF(SUM(sales), 0)) * 100), 0) AS profitwin
                   FROM orders"""
    
    # Lista de parámetros y condiciones WHERE
    conditions = []
    params = []

    if category:
        conditions.append("Category = %s")
        params.append(category)
    
    if year:
        conditions.append("YEAR(order_date) = %s")
        params.append(year)

    # Agregar las condiciones a la consulta si existen
    if conditions:
        sql_query += " WHERE " + " AND ".join(conditions)

    # Completar la consulta con GROUP BY y ORDER BY
    sql_query += " GROUP BY Customer_Name, city ORDER BY total_sales DESC LIMIT 10;"

    # Ejecutar la consulta SQL
    with connection.cursor() as cursor:
        cursor.execute(sql_query, params)
        rows = cursor.fetchall()

    # Preparar los datos para la respuesta JSON
    data = [
        {
            "Customer_Name": row[0],
            "city": row[1],
            "total_sales": row[2],
            "total_profit": row[3],
            "profit_percentage": row[4] if row[4] is not None else 0
        } 
        for row in rows
    ]

    return JsonResponse(data, safe=False)

def sales_by_month(request):
    year = request.GET.get('year')
    regions = request.GET.getlist('region')  # Obtener una lista de regiones

    # Consulta SQL base
    sql_query = """SELECT month(order_date) as months, SUM(sales) as total_sales FROM orders"""
    
    params = []
    conditions = []

    # Agregar filtro por año si se proporciona
    if year:
        conditions.append("year(order_date) = %s")
        params.append(year)

    # Agregar filtro por región si se proporciona
    if regions:
        placeholders = ', '.join(['%s'] * len(regions))
        conditions.append(f"region IN ({placeholders})")
        params.extend(regions)

    # Agregar condiciones a la consulta SQL
    if conditions:
        sql_query += " WHERE " + " AND ".join(conditions)

    sql_query += " GROUP BY months ORDER BY months ASC;"

    # Ejecutar la consulta
    with connection.cursor() as cursor:
        cursor.execute(sql_query, params)
        rows = cursor.fetchall()

    # Preparar los datos para la respuesta JSON
    data = [{"month": row[0], "total_sales": row[1]} for row in rows]

    return JsonResponse(data, safe=False)

def utilidad(request):

    sql_query = """SELECT region, (SUM(profit) / SUM(sales)) * 100 AS total_profit_percentage FROM orders group by region;"""
    with connection.cursor() as cursor:
        cursor.execute(sql_query)
        rows = cursor.fetchall()


    # Preparar los datos para la respuesta JSON
    data = [{"region": row[0], "total_profit_percentage": row[1]} for row in rows]
    return JsonResponse(data, safe=False)

def sales_variation(request):
    # Consulta SQL con CTE para calcular ventas por categoría y variación entre 2017 y 2018
    sql_query = """
        WITH yearly_sales AS (
            SELECT 
                category,
                YEAR(order_date) AS year,
                SUM(IFNULL(sales, 0)) AS total_sales
            FROM 
                orders
            WHERE 
                YEAR(order_date) IN (2018, 2017)
            GROUP BY 
                category,
                YEAR(order_date)
        )

        SELECT
            category,
            MAX(CASE WHEN year = 2018 THEN total_sales END) AS sales_2018,
            MAX(CASE WHEN year = 2017 THEN total_sales END) AS sales_2017,
            ROUND(
                CASE 
                    WHEN MAX(CASE WHEN year = 2017 THEN total_sales END) = 0 THEN NULL
                    ELSE ((MAX(CASE WHEN year = 2018 THEN total_sales END) - 
                           MAX(CASE WHEN year = 2017 THEN total_sales END)) / 
                           MAX(CASE WHEN year = 2017 THEN total_sales END)) * 100
                END, 2
            ) AS sales_variation_percentage
        FROM 
            yearly_sales
        GROUP BY
            category;
    """

    with connection.cursor() as cursor:
        cursor.execute(sql_query)
        rows = cursor.fetchall()

    # Preparar los datos para la respuesta JSON
    data = [
        {
            "category": row[0],
            "sales_2018": row[1] if row[1] is not None else 0,
            "sales_2017": row[2] if row[2] is not None else 0,
            "sales_variation_percentage": row[3] if row[3] is not None else "N/A"
        } 
        for row in rows
    ]

    return JsonResponse(data, safe=False)