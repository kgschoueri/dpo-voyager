/**
 * 3D Foundation Project
 * Copyright 2019 Smithsonian Institution
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import "@ff/ui/Button";
import { IButtonClickEvent } from "@ff/ui/Button";

import DocumentView, { customElement, html } from "./DocumentView";
import CVDocument from "../../components/CVDocument";
import CVReader, { IArticleEntry } from "../../components/CVReader";
import CVLanguageManager from "../../components/CVLanguageManager";
import {getFocusableElements, focusTrap} from "../../utils/focusHelpers";

////////////////////////////////////////////////////////////////////////////////

@customElement("sv-reader-view")
export default class ReaderView extends DocumentView
{
    protected reader: CVReader = null;
    protected language: CVLanguageManager = null;

    protected firstConnected()
    {
        super.firstConnected();
        this.classList.add("sv-reader-view");
    }

    protected renderMenuEntry(entry: IArticleEntry)
    {
        const article = entry.article;

        return html`<div role="menuitem" title="article" tabindex="0" @keydown=${e =>this.onKeyDown(e, article.id)} class="sv-entry" @click=${e => this.onClickArticle(e, article.id)}>
            <h1>${article.title}</h1>
            <p>${article.lead}</p>
        </div>`;
    }

    protected render()
    {
        const reader = this.reader;
        const language = this.language;

        if (!reader) {
            return html`<div class="ff-placeholder">Please select a document to display its articles.</div>`;
        }

        if (!reader.activeArticle) {
            const articles = reader.articles;
            return html`<div class="sv-left"></div><div role="menu" aria-label="articles" class="sv-article">
                <ff-button class="sv-nav-button" inline title=${language.getLocalizedString("Close Article Reader")} icon="close" @click=${this.onClickClose}></ff-button>
                ${articles.map(entry => this.renderMenuEntry(entry))}
            </div><div class="sv-right"></div>`;
        }

        return html`<div class="sv-left"></div><div class="sv-article" @keydown=${e =>this.onKeyDown(e, reader.activeArticle.id)} >
                <ff-button class="sv-nav-button" inline title=${language.getLocalizedString("Close Article Reader")} icon="close" @click=${this.onClickClose}></ff-button>
                <ff-button class="sv-nav-button" inline title=${language.getLocalizedString("Article Menu")} icon="bars" @click=${this.onClickMenu}></ff-button>
                <div role="region" aria-live="polite" title="article" class="sv-container"></div>
            </div><div class="sv-right"></div>`;
    }

    protected onClickMenu(event: IButtonClickEvent)
    {
        event.stopPropagation();
        this.reader.ins.articleId.setValue("");
        this.reader.ins.focus.setValue(true);
    }

    protected onClickClose(event: IButtonClickEvent)
    {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent("close"));
    }

    protected onClickArticle(e: MouseEvent, articleId: string)
    {
        this.reader.ins.articleId.setValue(articleId);
    }

    protected updated(changedProperties): void
    {
        super.updated(changedProperties);

        const reader = this.reader;

        if (reader) {
            if(reader.activeArticle) {
            const container = this.getElementsByClassName("sv-container").item(0) as HTMLElement;
            container.innerHTML = reader.outs.content.value;
            }
            if(reader.ins.focus.value) {
                this.setFocus();
                reader.ins.focus.setValue(false, true);
            }
        }
    }

    protected onActiveDocument(previous: CVDocument, next: CVDocument)
    {
        if (previous) {
            previous.setup.language.outs.language.off("value", this.onUpdate, this);
            this.reader.outs.content.off("value", this.onUpdate, this);
            this.reader.outs.article.off("value", this.onUpdate, this);
            this.language = null;
            this.reader = null;
        }
        if (next) {
            this.reader = next.setup.reader;
            this.language = next.setup.language;
            this.reader.outs.content.on("value", this.onUpdate, this);
            this.reader.outs.article.on("value", this.onUpdate, this);
            next.setup.language.outs.language.on("value", this.onUpdate, this);
        }
    }

    protected onKeyDown(e: KeyboardEvent, id: string)
    {
        const reader = this.reader;
        if ((e.code === "Space" || e.code === "Enter") && (reader && !reader.activeArticle)) {
            e.preventDefault();
            this.reader.ins.articleId.setValue(id);
            this.reader.ins.focus.setValue(true);
        }
        else if (e.code === "Escape") {
            e.preventDefault();
            if (!reader.activeArticle) { 
                this.dispatchEvent(new CustomEvent("close"));
            }
            else {
                reader.ins.articleId.setValue("");
                reader.ins.focus.setValue(true);
            }
        }
        else if(e.code === "Tab") {
            focusTrap(getFocusableElements(this) as HTMLElement[], e);
        }
    }

    protected setFocus() {
        const reader = this.reader;
        const container = reader.activeArticle ? this.getElementsByClassName("sv-nav-button").item(1) : this.getElementsByClassName("sv-entry").item(0);
        (container  as HTMLElement).focus();
    }
}