/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {CharacterLimitPlugin} from '@lexical/react/LexicalCharacterLimitPlugin';
import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';

// import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {HorizontalRulePlugin} from '@lexical/react/LexicalHorizontalRulePlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {TabIndentationPlugin} from '@lexical/react/LexicalTabIndentationPlugin';
import {TablePlugin} from '@lexical/react/LexicalTablePlugin';
import * as React from 'react';
import {useEffect, useState} from 'react';
import {CAN_USE_DOM} from './shared/canUseDOM';

//import {createWebsocketProvider} from './collaboration';
import {useSharedHistoryContext} from './context/SharedHistoryContext';
import TableCellNodes from './nodes/TableCellNodes';
import ActionsPlugin from './plugins/ActionsPlugin';
import AutocompletePlugin from './plugins/AutocompletePlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import ClickableLinkPlugin from './plugins/ClickableLinkPlugin'
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';

import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin'
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
// import ImagesPlugin from './plugins/ImagesPlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import {LayoutPlugin} from './plugins/LayoutPlugin/LayoutPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
// import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin';
import {MaxLengthPlugin} from './plugins/MaxLengthPlugin';
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizer from './plugins/TableCellResizer';
import TableHoverActionsPlugin from './plugins/TableHoverActionsPlugin';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import {TablePlugin as NewTablePlugin} from './plugins/TablePlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import YouTubePlugin from './plugins/YouTubePlugin';
import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';
import InlineImagePlugin from "./plugins/InlineImagePlugin";
import ButtonPlugin from './plugins/ButtonPlugin'

// const skipCollaborationInit =
//     // @ts-expect-error
//     window.parent != null && window.parent.frames.right === window;

export default function Editor(props): JSX.Element {
    const {historyState} = useSharedHistoryContext();
    const {
        /*isCollab,*/
        isAutocomplete,
        isMaxLength,
        isCharLimit,
        isCharLimitUtf8,
        isRichText = true,
        showTreeView,
        showTableOfContents,
        /*showComments,*/
        showActionBar,
        placeholderText = '',
        editable = true,
        bgColor,
        isCard,
        tableCellBackgroundColor= true,
        tableCellMerge= true,
        tableHorizontalScroll= true,
        theme
    } = props;
    const placeholder = <Placeholder>{placeholderText}</Placeholder>;
    const [floatingAnchorElem, setFloatingAnchorElem] =
        useState<HTMLDivElement | null>(null);
    const [isLinkEditMode, setIsLinkEditMode] = useState(false);
    const [isSmallWidthViewport, setIsSmallWidthViewport] =
        useState<boolean>(false);

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };


    useEffect(() => {
        const updateViewPortWidth = () => {
            const isNextSmallWidthViewport =
                CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

            if (isNextSmallWidthViewport !== isSmallWidthViewport) {
                setIsSmallWidthViewport(isNextSmallWidthViewport);
            }
        };

        window.addEventListener('resize', updateViewPortWidth);

        return () => {
            window.removeEventListener('resize', updateViewPortWidth);
        };
    }, [isSmallWidthViewport]);

    return (
        <>
            {isRichText && editable && <ToolbarPlugin/>}
            <div
                className={`
                    ${editable ? `${theme.editorContainer}` || `editor-container` : `${theme.editorViewContainer}` || `view-container`} 
                    ${showTreeView ? 'tree-view' : ''} ${!isRichText ? 'plain-text' : ''}
                    ${isCard ? theme.card : ''}
                `}
                style={{backgroundColor: bgColor}}
            >
                {isMaxLength && <MaxLengthPlugin maxLength={30}/>}
                <DragDropPaste/>
                {/*<AutoFocusPlugin />*/}
                <ClearEditorPlugin/>
                <ComponentPickerPlugin/>
                <EmojiPickerPlugin />
                <AutoEmbedPlugin/>
                <KeywordsPlugin/>
                <SpeechToTextPlugin/>
                <AutoLinkPlugin/>
               {/* {showComments ? <CommentPlugin
                    providerFactory={isCollab ? createWebsocketProvider : undefined}
                /> : ''}*/}
                {isRichText ? (
                    <>
                        {/*isCollab ? (
              <CollaborationPlugin
                id="main"
                providerFactory={createWebsocketProvider}
                shouldBootstrap={!skipCollaborationInit}
              />
            ) : (
              <HistoryPlugin externalHistoryState={historyState} />
            )*/}
                        <HistoryPlugin externalHistoryState={historyState}/>
                        <RichTextPlugin
                            contentEditable={
                                <div className={editable ? `${theme.editorScroller}` || "editor-scroller" : `${theme.viewScroller}` || "view-scroller"}>
                                    <div className={theme.editor.base || "editor"} ref={onRef}>
                                        <ContentEditable className={theme.contentEditable}/>
                                    </div>
                                </div>
                            }
                            placeholder={placeholder}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        
                        <CodeHighlightPlugin/>
                        <ListPlugin/>
                        <CheckListPlugin/>
                        <ListMaxIndentLevelPlugin maxDepth={7}/>
                        <TablePlugin
                          hasCellMerge={tableCellMerge}
                          hasCellBackgroundColor={tableCellBackgroundColor}
                          hasHorizontalScroll={tableHorizontalScroll}
                        />
                        <TableCellResizer />
                        <InlineImagePlugin/>
                        <ButtonPlugin />
                        <LinkPlugin/>
                       
                        <YouTubePlugin/>
                        <HorizontalRulePlugin/>

                        <TabFocusPlugin/>
                        <TabIndentationPlugin/>
                        <CollapsiblePlugin editable={editable}/>
                        <LayoutPlugin />
                        {floatingAnchorElem && !isSmallWidthViewport && (
                            <>
                                <DraggableBlockPlugin anchorElem={floatingAnchorElem}/>
                                {/*<CodeActionMenuPlugin anchorElem={floatingAnchorElem}/>*/}
                                <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} isLinkEditMode={isLinkEditMode} setIsLinkEditMode={setIsLinkEditMode}/>
                                <TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
                                <FloatingTextFormatToolbarPlugin
                                    anchorElem={floatingAnchorElem}
                                    showComments
                                />
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <PlainTextPlugin
                            contentEditable={<ContentEditable/>}
                            placeholder={placeholder}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin externalHistoryState={historyState}/>
                    </>
                )}
                {(isCharLimit || isCharLimitUtf8) && (
                    <CharacterLimitPlugin
                        charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
                        maxLength={5}
                    />
                )}
                {isAutocomplete && <AutocompletePlugin/>}
                <div>{showTableOfContents && <TableOfContentsPlugin/>}</div>
                {showActionBar && <ActionsPlugin isRichText={isRichText}/>}
            </div>
            {showTreeView && <TreeViewPlugin/>}
        </>
    );
}
