
// CREA EL GRAFICO
const onclick = async (api,periodos,serie,tipo) => {

    if(document.querySelector('#myChart')){ document.querySelector('#myChart').remove() } 
    if(document.querySelector('#myUl')){ document.querySelector('#myUl').remove() }
    
    const fragment =  document.createDocumentFragment()
    const contenedor = document.getElementById('contenedor')
    let canvas = document.createElement('canvas')
    canvas.setAttribute('id', 'myChart')
    fragment.appendChild(canvas);
    contenedor.appendChild(fragment);
    
    const chart = document.getElementById('myChart') 

    try {
        const data = await dataApi(api,periodos)

        new Chart( chart , {
            type: tipo,
            data: {
                labels: serie === 'true' ? data.etiquetas : data.etiquetas_v,
                datasets: [{
                    label: data.descripcion,
                    data: serie === 'true' ? data.data : data.data_v,
                    backgroundColor: 'rgb(135, 170, 170)',
                    // borderColor: 'rgb(146, 84, 200)',
                    // borderWidth: 1,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: data.descripcion,
                        color: 'rgb(33, 68, 68)',
                        font: {
                            size: '17'
                        } 
                    },
                    legend: {
                        display: false,
                        labels: {
                            color: 'rgb(26, 26, 64)'
                        }
                    }
                },
            },
            plugins:[{
                id: 'custom_canvas_background_color',
                beforeDraw: (chart) => {
                  const ctx = chart.canvas.getContext('2d');
                  ctx.save();
                  ctx.globalCompositeOperation = 'destination-over';
                  ctx.fillStyle = 'rgb(200, 227, 212)';
                  ctx.fillRect(0, 0, chart.width, chart.height);
                  ctx.restore();
                }
              }]
        })
        
        const fragment2 = document.createDocumentFragment();
        const template2 = document.getElementById('template').content
        template2.getElementById('descriDetalle').textContent = data.descripcion2
        template2.getElementById('frecuenciaDetalle').textContent = data.frecuencia
        template2.getElementById('periodoDetalle').textContent = `${data.inicio} / ${data.final} ` 
        template2.getElementById('varMensualDetalle').textContent = `${data.variaciones[0]}%`
        template2.getElementById('varAnualDetalle').textContent = `${data.variaciones[1]}%`
        template2.getElementById('varAcumuladaDetalle').textContent = `${data.variaciones[2]}%`
        template2.getElementById('fuenteDetalle').textContent = data.fuente
        template2.getElementById('unidadesDetalle').textContent = data.unidades
        const clone = template2.cloneNode(true);
        fragment2.appendChild(clone);
        
        const cont = document.getElementById('detalles')
        cont.appendChild(fragment2);
        
        document.getElementById('spinner').innerHTML = ''
       
    } catch (error) {
        alert(error)
    }
 
}

// FORMULARIO ELIJE SERIE

let selectedSelect
let nameSelect

const selectTag =  document.querySelectorAll('.btnSelect')

const seleccionado = selectTag.forEach ( sl => sl.addEventListener ('change', (e)=> {

    selectedSelect = e.target.name
    selectTag.forEach ( sl => {
        if (sl.name === selectedSelect) {
            sl.disabled = false
        } else {
            sl.disabled = true
        }
    })
    
}) )

// FORMULARIO SEND
const formulario = document.getElementById('form')
formulario.addEventListener('submit', e => {
    
    e.preventDefault()
    
    let datos = new FormData(formulario)
    
    let api = datos.get(selectedSelect)
    let periodos = datos.get('periodos')
    let serie = datos.get('serie')
    let tipo = datos.get('tipo')

    if(api && periodos && serie && tipo){ 
        
        document.getElementById('spinner').innerHTML = `
        <div class="text-center m-5">
        <div class="spinner-border m-5" role="status">
        <span class="visually-hidden"></span>
        </div>
        </div>
        `
        onclick(api,periodos,serie,tipo)
    
    } else {
        
        alert('Por favor, verifique haber seleccionado un indicador ')
    }

    
})

// RESETEAR 
const resetear = document.getElementById('resetear').addEventListener('click', () => {
    selectTag.forEach( sl => sl.disabled = false)

})

const otraConsulta = document.getElementById('otraConsulta').addEventListener('click', () => {
    selectTag.forEach( sl => sl.disabled = false)
    formulario.reset()
    if(document.querySelector('#myChart')){ document.querySelector('#myChart').remove() } 
    if(document.querySelector('#myUl')){ document.querySelector('#myUl').remove() }
})







