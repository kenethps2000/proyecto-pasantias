// Función para obtener datos filtrados
function getFilteredData() {
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;
    const category = document.getElementById('category').value;

    fetch(`/filtros/?start_date=${startDate}&end_date=${endDate}&category=${encodeURIComponent(category)}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#resultsTable tbody');
            tableBody.innerHTML = '';
            data.forEach(row => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${row.category}</td>
                        <td>${row.total_sales}</td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error('Error al obtener datos:', error));
}

// Función para obtener el Top 10 de clientes filtrado por categoría
function getTop10() {
    const category = document.getElementById('top10_category').value;
    const year = document.getElementById('top10_year').value;

    // Construir la URL con parámetros opcionales
    let url = '/top10/?';
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (year) url += `year=${encodeURIComponent(year)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#top10Table tbody');
            tableBody.innerHTML = '';
            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4">No se encontraron resultados.</td></tr>';
            } else {
                data.forEach(row => {
                    tableBody.innerHTML += `
                        <tr>
                            <td>${row.Customer_Name}</td>
                            <td>${row.city}</td>
                            <td>${row.total_sales}</td>
                            <td>${row.total_profit}</td>
                            <td>${row.profit_percentage + '%'}</td>
                        </tr>
                    `;
                });
            }
        })
        .catch(error => {
            console.error('Error al obtener Top 10 clientes:', error);
            alert('Error al obtener datos. Intente nuevamente.');
        });
}

function loadSalesByMonth() {
    const year = document.getElementById('year').value;
    const regionCheckboxes = document.querySelectorAll('input[name="region"]:checked');
    
    const selectedRegions = Array.from(regionCheckboxes).map(cb => cb.value);

    if (!year) {
        alert('Por favor, ingrese un año válido.');
        return;
    }

    // Crear la URL con parámetros opcionales
    let url = `/sales_by_month/?year=${year}`;
    
    if (selectedRegions.length > 0) {
        selectedRegions.forEach(region => {
            url += `&region=${region}`;
        });
    }

    fetch(url)
    .then(response => response.json())
    .then(data => {
        // Corregir el uso de 'item' en el map
        const months = data.map(entry => getMonthName(entry.month));
        const sales = data.map(entry => entry.total_sales);

        renderChart(months, sales);
    })
    .catch(error => {
        console.error('Error al obtener datos:', error);
        alert('Error al cargar los datos. Intente nuevamente.');
    });
}

// Función para obtener el nombre del mes
function getMonthName(monthNumber) {
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[monthNumber -1];
}

// Función para renderizar el gráfico con Chart.js
function renderChart(months, sales) {
    const ctx = document.getElementById('salesChart').getContext('2d');

    // Destruir el gráfico existente si hay uno
    if (window.salesChart && typeof window.salesChart.destroy === 'function') {
        window.salesChart.destroy();
    }

    // Crear una nueva instancia del gráfico de líneas
    window.salesChart = new Chart(ctx, {
        type: 'line',  // Cambiado a 'line' para un gráfico de líneas
        data: {
            labels: months,
            datasets: [{
                label: 'Ventas Totales',
                data: sales,
                borderColor: '#007BFF',
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderWidth: 2,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#007BFF',
                pointBorderColor: '#007BFF',
                tension: 0.3  // Suaviza las líneas (puedes ajustar este valor)
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ventas Totales'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mes'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// Función para cargar los datos de ganancias por región y actualizar las tarjetas
function loadProfitIndicators() {
    fetch('/utilidad/')  // Llamamos al endpoint que retorna los datos de ganancia por región
        .then(response => response.json())
        .then(data => {
            // Mapear los datos y actualizar las tarjetas
            data.forEach(entry => {
                const region = entry.region;
                const profitPercentage = entry.total_profit_percentage.toFixed(2) + '%';
                
                // Actualizar el contenido de cada tarjeta
                document.getElementById(region.toLowerCase() + '-profit').innerText = profitPercentage;
            });
        })
        .catch(error => {
            console.error('Error al obtener datos:', error);
            alert('Error al cargar los datos. Intente nuevamente.');
        });
}
// Función para cargar los datos de variación de ventas y mostrar en tarjetas
function loadSalesVariation() {
    fetch('/sales_variation/')  // Llamada al endpoint
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('card-containerV');
            container.innerHTML = ''; // Limpiar el contenedor antes de añadir tarjetas

            data.forEach(entry => {
                const { category, sales_2018, sales_2017, sales_variation_percentage } = entry;

                // Crear la tarjeta para cada categoría
                const card = document.createElement('div');
                card.classList.add('card');

                // Determinar el color del porcentaje de variación
                const variationClass = sales_variation_percentage < 0 ? 'negative' : 'variation';

                card.innerHTML = `
                    <h3>${category}</h3>
                    <p><strong>Ventas 2018:</strong> $${sales_2018.toLocaleString()}</p>
                    <p><strong>Ventas 2017:</strong> $${sales_2017.toLocaleString()}</p>
                    <p class="${variationClass}">
                        <strong>Variación:</strong> ${sales_variation_percentage !== "N/A" ? sales_variation_percentage + '%' : 'N/A'}
                    </p>
                `;

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error al obtener datos:', error);
            alert('Error al cargar los datos. Intente nuevamente.');
        });
}

// Cargar los indicadores cuando la página se cargue
document.addEventListener('DOMContentLoaded', loadProfitIndicators);
// Cargar las tarjetas cuando la página se cargue
document.addEventListener('DOMContentLoaded', loadSalesVariation);