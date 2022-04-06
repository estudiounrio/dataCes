const dataApi = async (api, periodos ) => {

    try {
        const dt = await fetch(`https://apis.datos.gob.ar/series/api/series/?ids=${api}&format=json&limit=1000`)
        const datos = await dt.json()
        const d = datos.data
        const final = datos.count
        const inicio = datos.count >= periodos ? periodos : final
        const etiquetas =[]
        const datas = []
        const etiquetas_s =[]
        const datas_s = []
        const frecuencia = datos.meta[0].frequency
        
        
        for(let i=0; i<=final-1;i++){
            frecuencia === 'month' ? etiquetas.push(convierteMes(d[i][0])) : etiquetas.push(convierteTrimestre(d[i][0]))
            datas.push(d[i][1])
        }
        
        for(let i=final-inicio; i<=final-1;i++){
            frecuencia === 'month' ? etiquetas_s.push(etiquetas[i]) : etiquetas_s.push(etiquetas[i])
            datas_s.push(datas[i])
        }

        const [datas_v,etiquetas_v,var_interanual,var_mensual,var_acumulada,frec] = variacion(datas,etiquetas,datos.meta[0].frequency,(final -inicio))
    
        const meta = {
            'ultimovalor': [datas[datas.length-1].toFixed(1),convierteValorFecha(etiquetas[etiquetas.length-1])],
            'etiquetas': etiquetas_s,
            'data': datas_s,
            'etiquetas_v': etiquetas_v,
            'data_v': datas_v,
            'variaciones': [var_mensual,var_interanual,var_acumulada],
            'descripcion': datos.meta[1].field.description,
            'unidades': datos.meta[1].field.units,
            'fuente': datos.meta[1].dataset.source,
            'descripcion2': datos.meta[1].dataset.description, //checkear si podria ir otra variable más descriptiva
            'frecuencia': frec,
            'inicio': convierteMes(datos.meta[0].start_date),
            'final': convierteMes(datos.meta[0].end_date)
        }
    
        return meta;
        
    } catch (error) {
        console.log(error)
    }
} 

const convierteMes = (f) => {
      
    let fecha= f.split('-')
    let mes = fecha[1]
    let año = fecha[0].substring(2,4)
    let text

    switch (mes) {
      case '01':
          text = "Ene";
          break;
      case '02':
          text = "Feb";
          break;
      case '03':
          text = "Mar";
          break;
      case '04':
          text = "Abr";
          break; 
      case '05':
          text = "May";
          break;
      case '06':
          text = "Jun";
          break;
      case '07':
          text = "Jul";
          break;
      case '08':
          text = "Ago";
          break;
      case '09':
          text = "Sep";
          break;
      case '10':
          text = "Oct";
          break;
      case '11':
          text = "Nov";
          break;
      case '12':
          text = "Dic";
          break;
      default:
          text = "No se encontro fecha";
    }

    const fe = `${text}-${año}`
    return fe
}

const convierteTrimestre = (f) => {
      
    let fecha= f.split('-')
    let mes = fecha[1]
    let año = fecha[0].substring(2,4)
    let text

    switch (mes) {
      case '01':
          text = "1T";
          break;
      case '04':
          text = "2T";
          break; 
      case '07':
          text = "3T";
          break;
      case '10':
          text = "4T";
          break;
      default:
          text = "No se encontro fecha";
    }

    const fe = `${text}-${año}`
    return fe
}

const convierteValorFecha = (f) => {
      
    let fecha= f.split('-')
    let mes = fecha[0]
    let año = '20'+fecha[1]
    let text

    switch (mes){
      case 'Ene':
          text = "enero";
          break;
      case 'Feb':
          text = "febrero";
          break;
      case 'Mar':
          text = "marzo";
          break;
      case 'Abr':
          text = "abril";
          break; 
      case 'May':
          text = "mayo";
          break;
      case 'Jun':
          text = "junio";
          break;
      case 'Jul':
          text = "julio";
          break;
      case 'Ago':
          text = "agosto";
          break;
      case 'Sep':
          text = "septiembre";
          break;
      case 'Oct':
          text = "octubre";
          break;
      case 'Nov':
          text = "noviembre";
          break;
      case 'Dic':
          text = "diciembre";
          break;
      default:
          text = "No se encontro fecha";
  }

  const fe =[text, año]
  return fe

}

const variacion = (datas,etiquetas,frecuencia,periodos) => {

    datas_v=[]
    etiquetas_v=[]
    let var_interanual, var_mensual, var_acumulada, frec

    for(let i=periodos; i<datas.length; i++){
        let vari = parseFloat((datas[i]/datas[i-1]-1)*100).toFixed(1)
        datas_v.push(vari)
        etiquetas_v.push(etiquetas[i])
    }

    if(frecuencia==='month'){
        frec='mensual'
        var_interanual = parseFloat((datas[datas.length-1]/datas[datas.length-13]-1)*100).toFixed(1)
        var_mensual = datas_v[datas_v.length-1]
        var_acumulada = varAcumulada(etiquetas,datas,frecuencia)
    }

    if(frecuencia==='quarter'){
        frec='trimestral'
        var_interanual = parseFloat((datas[datas.length-1]/datas[datas.length-5]-1)*100).toFixed(1)
        var_mensual = datas_v[datas_v.length-1]
        var_acumulada = varAcumulada(etiquetas,datas,frecuencia)
    }
   
    return [datas_v,etiquetas_v,var_interanual,var_mensual,var_acumulada, frec]

}

const varAcumulada = (etiquetas,datas,frecuencia) => {

    let variacionAcumulada
    datas_im=[]
    etiquetas_im=[]

    if(frecuencia==='month'){
        let meses = ['Ene', 'Feb', 'Mar', 'Abr','May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        let mes= etiquetas[etiquetas.length-1].split('-')
        let mesIndex = meses.findIndex( i => i === mes[0])
        variacionAcumulada = parseFloat(((datas[datas.length-1]/datas[datas.length - mesIndex-2]-1)*100).toFixed(1))
    }

    if(frecuencia==='quarter'){
        let meses = ['1T', '2T', '3T', '4T']
        let mes= etiquetas[etiquetas.length-1].split('-')
        let mesIndex = meses.findIndex( i => i === mes[0])
        variacionAcumulada = parseFloat(((datas[datas.length-1]/datas[datas.length - mesIndex-2]-1)*100).toFixed(1))
    }

    return variacionAcumulada
    
}

