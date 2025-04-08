import {parseJSON} from "../../../_utils";
import React from "react";
import { get } from "lodash-es"
import TemplateSelector from "./TemplateSelector";
import { RegisteredComponents } from '../../../../ui/dataComponents/selector'

export const SectionThumb =({section,source,sectionControl={},updateSectionControl}) => {

    let data = parseJSON(section?.element?.['element-data']) || {}
    let type = section?.element?.['element-type'] || ''
    let comp = RegisteredComponents[type] || {}
    let controlVars = [
        ...(comp?.variables || []),
        ...(data?.additionalVariables || []),
        ...(Array.isArray(data?.filters) ? data.filters : []).map(f => ({name: f.column}))
    ] // add filters here
    const attributes = React.useMemo(() => {

        let md = get(source, ["metadata", "value", "columns"], get(source, "metadata", []));
        if (!Array.isArray(md)) {
            md = [];
        }

        return md.map(d => d.name)

    }, [source]);

    //console.log('section Thumb', data)


    return (
        <div className='p-4 border rounded mb-1'>

            <div>Title: {section?.title} {section?.id}</div>
            <div>{type}</div>
            <div>
                {controlVars
                    .filter(k => !k.hidden)
                    .map(k => {
                        return (
                            <div className='flex' key={k.name}>
                                <div className='flex-1 items-center'>
                                    <div>{k.name}</div>
                                    <div className='text-xs'>{typeof data[k.name] === 'object' ? JSON.stringify(data[k.name]) : data[k.name]}</div>
                                </div>
                                <div className='flex-1 flex items-center'>
                                    <TemplateSelector
                                        options={['',...attributes]}
                                        value={sectionControl[k.name] || ''}
                                        onChange={v => {
                                            updateSectionControl({...sectionControl,...{[k.name]: v}})
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}