import { Fragment, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'



export default function TemplateSelector({options=[], onChange, value, nameAccessor=d => d?.name || d , valueAccessor, className }) {
  const [query, setQuery] = useState('')
  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
          (nameAccessor(option) + '')
            .toLowerCase()
            .replace(/\s+/g, '')
            .startsWith(query.toLowerCase().replace(/\s+/g, ''))
        )

  // console.log('selected', value) 
  return (
    <div className="w-full">
      <Combobox value={value} onChange={onChange}>
        <div className="relative mt-1">
          <div className={className || "relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm"}>
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={(option) => nameAccessor(option) || option }
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <div
                className="h-5 w-5 text-gray-400 flex items-center justify-center"
                aria-hidden="true"
              >
                <div class='fa fa-chevron-down' />
              </div>
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredOptions
                  .filter((d,i) => i < 60)
                  .map((option,i) => (
                  <Combobox.Option
                    key={i}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {nameAccessor(option) || option}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-blue-600'
                            }`}
                          >
                            <div className="h-5 w-5 flex items-center justify-center" aria-hidden="true">
                              <div className='fa fa-check'/>
                            </div>
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  )
}
