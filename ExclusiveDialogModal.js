class ExclusiveDialogModal{
    
    container = null;
    queue = null;
    dialogs = null;
    removeHandlers = null;
    running = false;
    _resolve = null;
    _reject = null;
    showModals = null
    constructor(container){
        this.container = container;
        this.dialogs = {}
        this.showModals = {} // dialog 들의 showModal 동작용
        this.queue = [];
        
        this.container.querySelectorAll('dialog[data-dialog-id]').forEach(dialog => {
            return this.attach(dialog)
        });
        
    }
    attach(dialog){
        const dialogId = dialog.dataset.dialogId;
        if(this.dialogs[dialogId] ){
            console.warn(`dialogId="${dialogId}"는 이미 등록되어 있습니다.`);
            return false;
        }
        this.dialogs[dialogId] = dialog;
        this.addEventListenerForDialog(dialog);
        this.showModals[dialogId] = this.createDialogCaller(dialog);
        if(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(dialogId) && !this[dialogId]){
            this[dialogId] = this.showModals[dialogId];
        }else{
            console.debug(`dialogId="${dialogId}"가 규칙에 맞지 않아 직접 호출 함수로 등록할 수 없습니다.`);
        }
        return true;
    }
    

    createDialogCaller(dialog){
        return (message='',defaultValue='')=>{
            const promise = new Promise((resolve,reject)=>{ this.addQueue(()=>{this.#showModal(resolve,reject,dialog,message,defaultValue)}) })
            this.runQueue();
            return promise;
        }
    }
    
    #showModal(resolve,reject,dialog,message='',defaultValue=''){
        // console.log('showAlert',[...arguments]);
        this._resolve = resolve
        this._reject = reject
        const messageBox = dialog.querySelector('.dialog-message');
        if(messageBox){ messageBox.textContent = message; }
        const input = dialog.querySelector('input, select, textarea');
        if(input){
            input.defaultValue = defaultValue
            input.value = defaultValue
        }
        dialog.showModal();
    }
    addEventListenerForDialog(dialog){
        dialog.closedBy="none"; // 크롬대응
        dialog.addEventListener('cancel',(event)=>{event.preventDefault();})  // 사파리 대응. ESC 키 막기
        dialog.addEventListener('close',(event)=>{ 
            // console.log('close');
            const target = event.target
            // console.log('returnValue',target.returnValue);
            if(this._resolve){
                this._resolve(target.returnValue);
            }
            this.runQueue(true)
        })
    }


    addQueue(q){
        this.queue.push(q)
    }
    runQueue(stopRunning=false){
        // console.log('runQueue',this.queue.length,this.running);
        if(stopRunning){ this.running = false; }
        if(this.running){return}
        if (this.queue.length < 1) { return; }
        this.running = true;
        const q = this.queue.shift();
        return q();
    }

    static close(el,val){
        el.closest('dialog')?.close(val);
    }
}
