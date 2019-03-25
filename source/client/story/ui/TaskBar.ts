/**
 * 3D Foundation Project
 * Copyright 2018 Smithsonian Institution
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

import System from "@ff/graph/System";

import "@ff/ui/Button";
import Button, { IButtonClickEvent } from "@ff/ui/Button";

import SystemElement, { customElement, html } from "../../core/ui/SystemElement";

import CVStoryController from "../components/CVStoryController";
import CVTaskProvider, { IActiveTaskEvent } from "../components/CVTaskProvider";


////////////////////////////////////////////////////////////////////////////////

@customElement("sv-task-bar")
export default class TaskBar extends SystemElement
{
    protected story: CVStoryController = null;
    protected taskProvider: CVTaskProvider = null;

    constructor(system?: System)
    {
        super(system);

        this.story = system.getMainComponent(CVStoryController);
        this.taskProvider = system.getMainComponent(CVTaskProvider);
    }

    protected firstConnected()
    {
        this.classList.add("sv-task-bar");
    }

    protected connected()
    {
        this.story.ins.expertMode.on("value", this.onUpdate, this);
        this.taskProvider.on<IActiveTaskEvent>("active-component", this.onUpdate, this);
    }

    protected disconnected()
    {
        this.story.ins.expertMode.off("value", this.onUpdate, this);
        this.taskProvider.off<IActiveTaskEvent>("active-component", this.onUpdate, this);
    }

    protected render()
    {
        const tasks = this.taskProvider.scopedComponents;
        const activeTask = this.taskProvider.activeComponent;
        const expertMode = this.story.ins.expertMode.value;
        const taskMode = this.story.ins.mode.getOptionText();

        return html`
            <img class="sv-logo" src="images/voyager-75grey.svg" alt="Logo"/>
            <div class="sv-mode ff-text">${taskMode}</div>
            <div class="sv-spacer"></div>
            <div class="sv-divider"></div>
            <div class="ff-flex-row ff-group" @click=${this.onClickTask}>
                ${tasks.map((task, index) => html`<ff-button text=${task.text} icon=${task.icon} index=${index} ?selected=${task === activeTask}></ff-button>`)}
            </div>
            <div class="sv-divider"></div>
            <div class="sv-spacer"></div>
            <div class="sv-divider"></div>
            <div class="ff-flex-row ff-group">
                <ff-button text="Save" icon="save" @click=${this.onClickSave}></ff-button>
                <ff-button text="Download" icon="download" @click=${this.onClickDownload}></ff-button>
                <ff-button text="Exit" icon="exit" @click=${this.onClickExit}></ff-button>
                <div class="sv-divider"></div>
                <ff-button text="Expert Mode" icon="expert" ?selected=${expertMode} @click=${this.onClickExpertMode}></ff-button>
            </div>
        `;
    }

    protected onClickTask(event: IButtonClickEvent)
    {
        if (event.target instanceof Button) {
            const tasks = this.taskProvider.scopedComponents;
            this.taskProvider.activeComponent = tasks[event.target.index];
        }
    }

    protected onClickSave()
    {
        this.story.ins.save.set();
    }

    protected onClickDownload()
    {
        this.story.ins.download.set();
    }

    protected onClickExit()
    {
        this.story.ins.exit.set();
    }

    protected onClickExpertMode()
    {
        const prop = this.story.ins.expertMode;
        prop.setValue(!prop.value);
    }
}