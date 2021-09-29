import qs from 'qs'
import orderBy from 'lodash/orderBy'

// API uses repeat format for querystring array params
const paramsSerializer = (params) => qs.stringify(params, { arrayFormat: 'repeat' })

const escoQuery = (path = '') => `https://ec.europa.eu/esco/api/${path}`

const ESCOAPI = () => {
  const getTextSearch = (text, lang) => {
    const params = `search?text=${text}&language=${lang}&full=true`

    return window.fetch(escoQuery(params))
      .then(res => {
        const data = res.json()
        const returnList = data._embedded ? data._embedded.results : []
        return returnList
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        console.error(error)
      })
  }

  const getTopLevelConcepts = (lang) => {
    const params = `resource/related?uri=http://data.europa.eu/esco/concept-scheme/occupations&relation=hasTopConcept&language=${lang}`
    
    return window.fetch(escoQuery(params))
      .then(res => res.json())
      .then(data => {
        const concepts = data._embedded ? data._embedded.hasTopConcept : []
        let ordered = []
        if (Array.isArray(concepts)) ordered = orderBy(concepts, ['title'], ['asc'])
        return ordered
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        console.error(error)
      })
  }

  const getChildOccupations = (uri, lang) => {
    const params = `resource/related?uri=${uri}&relation=narrowerConcept&language=${lang}`
    
    return window.fetch(escoQuery(params))
      .then(res => res.json())
      .then(data => {
        const occupations = data._embedded ? data._embedded.narrowerConcept : []
        let ordered = []
        if (Array.isArray(occupations)) ordered = orderBy(occupations, ['title'], ['asc'])
        return ordered
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        console.error(error)
      })
  }

  return {
    getTextSearch: getTextSearch,
    getTopLevelConcepts: getTopLevelConcepts,
    getChildOccupations: getChildOccupations
  }
}

export default ESCOAPI
