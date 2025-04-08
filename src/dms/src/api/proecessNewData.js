import { get } from "lodash-es";;
import { cloneDeep } from "lodash-es"

export async function processNewData (dataCache, activeIdsIntOrStr, stopFullDataLoad, filteredIdsLength, app, type, dmsAttrsConfigs,format,falcor) {
    const activeIds = Array.isArray(activeIdsIntOrStr) ? activeIdsIntOrStr.map(id => +id) : activeIdsIntOrStr;
    // console.log('activeIds', activeIds)
    let newData = []

    // -----------------------------------------------------------------------------------------------------
    let newDataVals = Object.values(get(
        dataCache,
        ['dms', 'data', 'byId'],
        {}
    ))
    .filter(d => (
        (stopFullDataLoad ? activeIds?.length && activeIds.includes(+d.id) : true) &&
        d.id &&
        d.app === app &&
        d.type === type
    ))
    const attrHash = format.attributes.reduce((out,curr) => {
        out[curr.key] = curr;
        return out
    },{})
    
    for(const k in newDataVals) {
        // flatten data into single object
        let d = cloneDeep(newDataVals[k])
        let out = d?.data?.value || {}
        //console.log('hola', k, out, newDataVals)
       

        Object.keys(d)
            .filter(k => k !== 'data')
            .forEach(col => {
                if(col.includes('data ->> ')){
                    let attr = col.split('->>')[1].trim().replace(/[']/g, '')
                    let val = d[col]
                    // handles JSON TYPE
                    if(attrHash[attr]?.type === 'json' && typeof val !== 'object'){
                        val = JSON.parse(val) || {}
                    }
                    out[attr] = val
                } else {
                    //console.log('testing', d, col, d[col])
                    out[col] = d[col]
                }

            })

        newData.push(out);
       
    }
    if(format?.defaultSort) {
        newData = format.defaultSort(newData)
    }
    let i = 0 
    for(const d in newData) { 
        if(activeIds === 'loadAll' || activeIds.includes(+newData[d].id) || i === 0) {
            //console.time(`load dms formats ${newData[d].id}`)
            //console.log('load dms data', activeIds, newData[d].id)
            await loadDmsFormats(newData[d],dmsAttrsConfigs, format, falcor);
            //console.timeEnd(`load dms formats ${newData[d].id}`)
        }
        i++;
    }
    
    return newData
}


async function loadDmsFormats (item,dmsAttrsConfigs, format, falcor) {

    // ----------------------------------------
    // if attrs are dmsformat and have refs
    // load that data
    // check if the data has dmsformats
    // load that data
    // to do: make this non-blocking / lazy load
    // 
    // ----------------------------------------

    if(!item) return;
    //console.log('loadDmsFormats', item)
    let dmsKeys = Object.keys(item)
        .filter(d => Object.keys(dmsAttrsConfigs).includes(d))

    // get the format/attributes of dms types to recurse
    let dmsSubFormats = Object.keys(dmsAttrsConfigs)
        .reduce((out, key) => {
            let fmatch = format?.registerFormats?.filter(f => {
                return f.type === dmsAttrsConfigs[key].format.split('+')[1]
            })?.[0]
            if(fmatch) {
                out[key] = fmatch
            }
            return out
        },{})



    // console.log('loadDmsFormats item:', item.id, item.type , 'dmsKeys', dmsKeys, dmsAttrsConfigs, format, dmsSubFormats)

    for (const key of dmsKeys) {
        const dmsFormatRequests = []
         
        const dmsSubAttrsConfigs = (Object.values(dmsSubFormats?.[key]?.attributes|| {}))
            //.filter(d => !Array.isArray(filter?.attributes) || filter.attributes.includes(d.key))
            .filter(d => d.type === 'dms-format')
            .reduce((out,curr) => {
                out[curr.key] = curr
                return out
            },{})
        // console.log('key', key, dmsSubFormats)
        

        if(typeof item?.[key] === 'string') {
            item[key] = JSON.parse(item[key]) 
        } 
        // if dmstype isArray
        const attrsToFetch = ['data', 'created_at', 'updated_at', 'created_by', 'updated_by']
        if(typeof item?.[key]?.[Symbol.iterator] === 'function') {
            for (let ref of item[key]) {
                if(ref.id) {
                    dmsFormatRequests.push(['dms','data', 'byId', ref.id, attrsToFetch])
                }
            }
        } else if(item[key]?.id) {
            // if dmstype is single

            dmsFormatRequests.push(['dms','data', 'byId', item[key]?.id, attrsToFetch])
        }

        if(dmsFormatRequests.length > 0) {
            let newData = await falcor.get(...dmsFormatRequests)
            // console.log('testing dmsFormatRequests', newData)
            // if dmstype isArray
            if(typeof item?.[key]?.[Symbol.iterator] === 'function') {
                let index = 0
                for (let ref of item[key]) {
                    if(ref.id) {
                        let value = get(newData, ['json','dms','data', 'byId', ref.id, 'data'])
                        const meta = attrsToFetch.filter(a => a !== 'data')
                                                     .reduce((acc, metaKey) => ({...acc, [metaKey]: get(newData, ['json','dms','data', 'byId', ref.id, metaKey])}) , {})

                        // if new item has dms-format data, recursively fetch
                        if(Object.keys(dmsSubAttrsConfigs).length > 0){
                            await loadDmsFormats(value, dmsSubAttrsConfigs, dmsSubFormats[key], falcor)
                        }
                        item[key][index]= {...ref,...value, ...meta}
                        index += 1
                    }
                }
            // dmstype not array
            } else {
                let value = get(newData, ['json','dms','data', 'byId', item[key].id, 'data'])
                const meta = attrsToFetch.filter(a => a !== 'data')
                                             .reduce((acc, metaKey) => ({...acc, [metaKey]: get(newData, ['json','dms','data', 'byId', item[key].id, metaKey])}) , {})

                item[key] = {...item[key], ...value, ...meta}
            }
            
        }
    }
    //console.log('item', item)
}


