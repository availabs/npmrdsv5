//import { Promise } from "bluebird";
import { parseJSON } from '../../../_utils'
import { RegisteredComponents } from '../../../../ui/dataComponents/selector'
import {dmsDataEditor, dmsDataLoader} from '../../../../../../index'
import { cloneDeep } from "lodash-es"
import {getConfig} from "../pages";



export const generatePages = async ({
                                        item, url, destination, id_column, dataRows, falcor, setLoadingStatus, locationNameMap,
                                        setGeneratedPages, from, to, urlSuffixCol='geoid', app, type, apiLoad
                                    }) => {
    setLoadingStatus('Generating Pages...', dataRows)
    const idColAttr =
        dataRows
            .filter((d, i) => (!from || !to) || (i >= from && i <= to))
            .sort((a,b) => a?.state_fips ? +b[id_column.name] - +a[id_column.name] : true)
            .map(d => d[id_column.name])
    // .filter((d,i) => (d && (i <= 10)))

    let i = 0;

    // add page ids to this variable to set generatedPages. mainly used to change button text to Update pages from Generate Pages.
    const createdOrUpdatedPageIdStore = [];
    await PromiseMap(idColAttr, (async(idColAttrVal, pageI) => {

        const existingPage = await locationNameMap.reduce(async (acc, mao_type) => {
            const prevPages = await acc;
            const currentPages = await dmsDataLoader(falcor, getConfig({
                app,
                type,
                filter: {[`data->>'template_id'`]: [item.id], [`data->>'id_column_value'`]: [idColAttrVal]},
            }), '/');
            return currentPages[0];
        }, Promise.resolve([]));

        // if(existingPage?.length > 1){
        //     console.warn('<generate page> More than one page found for', idColAttrVal)
        // }
        // if(new Date(existingPage?.updated_at?.value) > new Date("2024-04-12T00:00:00.000Z")){
        //     setLoadingStatus(`skipping ${idColAttrVal}`)
        //     return Promise.resolve()
        // }
        // console.log('existing page', idColAttrVal, existingPage)

        const sectionIds =  existingPage?.data?.value?.sections?.map(section => section.id) || [];
        setLoadingStatus(`${existingPage ? `Updating` : 'Generating'} page ${++i}/${idColAttr?.length}`);

        const generatedSections = await sectionIds.reduce(async (acc, sectionId) => { //dont load data here?
            const prevSections = await acc;
            const currentSections = await dmsDataLoader(
                falcor,
                getConfig({
                    app,
                    type: `${type}|cms-section`,
                    filter: {
                        'id': [sectionId] // [] of ids
                    },
                }), '/');

            return [...prevSections, ...currentSections];
        }, Promise.resolve([]));

        const dataControls = item.data_controls;
        const activeDataRow = dataRows.find(dr => dr[id_column.name] === idColAttrVal) || {};

        let updates = await Promise.allSettled(item.sections.map(s => s.id).map(section_id => {
            let templateSection = item.sections.find(d => d.id === section_id)  || {};
            // let pageSection = generatedSections.find(s => s.data.value.element['template-section-id'] === section_id); // if we don't need to pull this data, save resources.
            let data = parseJSON(templateSection?.element?.['element-data']) || {}
            let type = templateSection?.element?.['element-type'] || ''
            let comp = RegisteredComponents[type] || {}


            let controlVars = (comp?.variables || []).reduce((out,curr) => {
                out[curr.name] = curr.name === id_column.name ? idColAttrVal : data[curr.name]
                return out
            },{})

            let updateVars = Object.keys(dataControls?.sectionControls?.[section_id] || {}) // check for id_col
                .reduce((out,curr) => {
                    const attrName = dataControls?.sectionControls?.[section_id]?.[curr]?.name || dataControls?.sectionControls?.[section_id]?.[curr];

                    out[curr] = attrName === id_column.name ? idColAttrVal : (activeDataRow[attrName] || dataControls?.active_row?.[attrName] || null)
                    return out
                },{})

            let additionalVariables = data.additionalVariables?.map(variable => {
                // update the defaultValue here
                const attrName = variable.name;
                const sectionControlMappedName = dataControls?.sectionControls?.[section_id]?.[attrName];
                variable.defaultValue = activeDataRow?.[sectionControlMappedName] || variable.defaultValue; // default to the value user set in template. some filters may not change for each page.
                return variable
            })

            let filters = Array.isArray(data.filters) ? data.filters.map(filter => {
                // update the defaultValue here
                const attrName = filter.column;
                const sectionControlMappedName = dataControls?.sectionControls?.[section_id]?.[attrName];
                if(sectionControlMappedName){
                    filter.values = [dataControls?.active_row?.[sectionControlMappedName]]
                    filter.valueSets = [dataControls?.active_row?.[sectionControlMappedName]]
                }

                return filter
            }) : data.filters;

            let args = {...controlVars, ...updateVars, additionalVariables, filters, apiLoad}

            try {
                // if(pageI > 8){
                //     throw new Error(`custom error for section id ${section_id} page ${idColAttrVal}`)
                // }
                return comp?.getData ? comp.getData(args,falcor).then(async data => {
                    return {section_id, data, type}
                }) : ({section_id, data, type})
            }catch (err){
                console.error('<generatePages> Error: ', idColAttrVal, err)
                return ({section_id, data, err, type})
            }
        }))
        await falcor.setCache({});
// disaster 4154 shows data on template, but not on generated page
        //console.log('updates', updates)

        if(updates.length > 0) {
            const updatedSections = item.sections
                .map(s => updates.find(u => u?.value?.section_id === s.id)?.value || s) // to preserve order
                .filter(u => u)
                .map(({section_id, data, err, type}) => {
                    let templateSection = item.sections.find(d => d.id === section_id)  || {};
                    let pageSection = generatedSections.find(d => d.data.value.element['template-section-id'] === section_id)  || {};
                    let section = pageSection?.data?.value || {element:{}};

                    if(pageSection?.id){
                        section.id = pageSection?.id; // to prevent creating new section
                    }

                    section.title = templateSection.title;
                    section.level = templateSection.level;
                    section.size = templateSection.size;
                    section.tags = templateSection.tags;
                    section.status = err ? JSON.stringify(err, Object.getOwnPropertyNames(err)) : 'success';
                    section.element['element-data'] = JSON.stringify(data);
                    section.element['element-type'] = type;
                    section.element['template-section-id'] = section_id; // to update sections in future
                    // console.log('section', section, templateSection)
                    return section;
                })

            // genetate
            //const app
            //const type = destination || item.type // defaults to play
            const sectionType = `${type}|cms-section`

            const sectionConfig = {format: {app, type: sectionType}};
            const pageConfig = {format: {app, type}};

            try {
                //create all sections first, get their ids and then create the page.
                const newSectionIds = await PromiseMap(
                    updatedSections.map((section) => dmsDataEditor(falcor, sectionConfig, section)),
                    p => p,
                    {concurrency: 10, saveResponse: true});

                const formatNameForURL = name => name.toLowerCase().replace(' county', '').replace('.', '').replace(/ /g, '_');

                const urlSuffix =
                    urlSuffixCol === 'county' ?
                        formatNameForURL(activeDataRow?.['county'] || activeDataRow?.['name']) || idColAttrVal :
                        idColAttrVal;

                const newPage = {
                    ...existingPage && {id: existingPage.id},
                    ...existingPage?.data?.value || {},
                    id_column_value: idColAttrVal,
                    template_id: item.id,
                    sidebar: item.sidebar,
                    header: item.header,
                    footer: item.footer,
                    full_width: item.full_width,
                    hide_in_nav: 'true', // not pulling though?
                    index: 999,
                    url_slug: `${url || id_column.name}/${urlSuffix}`,
                    title: `${id_column.name} ${idColAttrVal} Template`,
                    num_errors: updatedSections.filter(section => section.status !== 'success').length,
                    sections: [
                        ...updatedSections.map((section, i) => ({ // updatedSections contains correct order
                            "id": section.id || newSectionIds[i]?.id,
                            "ref": `${app}+${type}|cms-section`
                        })),
                        ...generatedSections.filter(section => !section.data.value.element['template-section-id']) // non-template sections
                            .map((section, i) => ({
                                "id": section.id,
                                "ref": `${app}+${type}|cms-section`
                            })),
                    ],
                    draft_sections: [
                        ...updatedSections.map((section, i) => ({ // updatedSections contains correct order
                            "id": section.id || newSectionIds[i]?.id,
                            "ref": "dms-site+cms-section"
                        })),
                        ...generatedSections.filter(section => !section.data.value.element['template-section-id']) // non-template sections
                            .map((section, i) => ({
                                "id": section.id,
                                "ref": `${app}+${type}|cms-section`
                            })),
                    ]
                }

                try {
                    const resPage = await dmsDataEditor(falcor, pageConfig, newPage);
                    createdOrUpdatedPageIdStore.push({id: resPage?.id, num_errors: newPage.num_errors, id_column_value: newPage.id_column_value})
                }catch (err){
                    console.error('<generatePages> Create/Update Page Error:', idColAttrVal, err)
                }
            }catch (err){
                console.error('<generatePages> Create/Update Sections Error:', idColAttrVal, err)
            }

        }

    }), {concurrency: 10, saveResponse: false})
    setGeneratedPages(createdOrUpdatedPageIdStore)
    setLoadingStatus(undefined)
}

export function PromiseMap (iterable, mapper, options = {}) {
    let concurrency = options.concurrency || Infinity

    let index = 0
    const results = []
    const pending = []
    const iterator = iterable[Symbol.iterator]()

    while (concurrency-- > 0) {
        const thread = wrappedMapper()
        if (thread) pending.push(thread)
        else break
    }

    return Promise.all(pending).then(() => results)

    function wrappedMapper () {
        const next = iterator.next()
        if (next.done) return null
        const i = index++
        const mapped = mapper(next.value, i)
        return Promise.resolve(mapped).then(resolved => {
            if(options.saveResponse){
                results[i] = resolved;
            }
            console.log('size of the results object in PromiseMap:', JSON.stringify(results).length, results);
            return wrappedMapper()
        })
    }
}