import {SourcesSelect} from "./SourceSelect";
import {ViewsSelect} from "./ViewsSelect";
import ViewInfo from "./ViewInfo";
import {SectionListControls} from "./SectionListControls";
import React from "react";

const TemplateSourceSelector = ({
       item, dataControls = {}, setDataControls, baseUrl,
       loadingStatus,
       setLoadingStatus, apiLoad
    }) => {
    // console.log('TemplateSourceSelector', dataControls)
    const updateDataControls = (k, v) => {
        setDataControls({...dataControls, [k]: v})
    }

    return (
        <div className="relative mt-6 flex-1 px-4 sm:px-6">
            <span className='text-sm text-gray-500 p-1'>Select Template Source:</span>
            <SourcesSelect
                value={dataControls?.source}
                onChange={(v) => {
                    // console.log('SourcesSelect onChange', v)
                    updateDataControls('source', v)
                }}
            />
           

            {dataControls?.source?.source_id ? <ViewsSelect
                source_id={dataControls?.source?.source_id}
                value={dataControls.view?.view_id}
                onChange={(v) => {
                    updateDataControls('view', v)
                }}
            /> : ''}

            {dataControls?.source?.source_id && dataControls?.view?.view_id ?
                <div>
                    <ViewInfo
                        item={item}
                        source={dataControls?.source}
                        view={dataControls?.view}
                        id_column={dataControls?.id_column}
                        active_row={dataControls?.active_row}
                        onChange={(k, v) => {
                            if (k === 'id_column') {
                                updateDataControls('id_column', v)
                                //updateDataControls('active_id','')
                                setDataControls({
                                    ...dataControls, ...{
                                        id_column: v, active_row: {}
                                    }
                                })
                            }
                            if (k === 'active_row') {
                                //updateDataControls('active_id',v)
                                //console.log('active_id', v)
                                setDataControls({...dataControls, ...v})
                            }
                        }}
                        loadingStatus={loadingStatus}
                        setLoadingStatus={setLoadingStatus}
                        baseUrl={baseUrl}
                        apiLoad={apiLoad}
                    />

                    <SectionListControls
                        sections={item.sections}
                        sectionControls={dataControls.sectionControls}
                        source={dataControls?.source}
                        onChange={e => {
                            updateDataControls('sectionControls', {...dataControls.sectionControls, ...e})
                        }}
                    />
                </div> : ''
            }

            <div>
                <pre>
                    {JSON.stringify(dataControls, null, 3)}
                </pre>
            </div>

        </div>
    )
}

export default TemplateSourceSelector