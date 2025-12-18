class ExclusiveDialog{
    
    queue = null;
    dialogs = null;
    running = false;
    _resolve = null;
    _reject = null;
    showModals = null
    
    constructor(container=null){
        
        this.dialogs = {}
        this.showModals = {} // dialog 들의 showModal 동작용
        this.queue = [];
        
        if(container) this.attachAll(container);        
    }
    attachAll(container){
        container.querySelectorAll('dialog[data-dialog-id]').forEach(dialog => {
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
        const dialogCaller = (message='',defaultValue='')=>{
            const promise = new Promise((resolve,reject)=>{ this.addQueue(()=>{this.#showModal(resolve,reject,dialog,message,defaultValue)}) })
            this.runQueue();
            return promise;
        }
        dialogCaller.close = (val)=>{ this.close(dialog,val) }
        return dialogCaller;
    }
    
    #showModal(resolve,reject,dialog,message='',defaultValue=''){
        // console.log('showAlert',[...arguments]);
        this._resolve = resolve
        this._reject = reject
        dialog.querySelectorAll('.dialog-message').forEach((messageBox)=>{
            messageBox.textContent = message;
        });
        
        const input = dialog.querySelector('input, select, textarea'); // 가장 첫 input 요소
        if(input){
            input.defaultValue = defaultValue
            input.value = defaultValue
        }

        window.document.body.classList.add('exclusive-dialog-open');
        dialog.showModal();

        requestAnimationFrame(()=>{
            const firstInputOrButton = dialog.querySelector('input:enabled:not([type=hidden]), select:enabled, textarea:enabled, button:enabled');
            if(firstInputOrButton){
                firstInputOrButton.focus()
            }
        })
        
    }
    addEventListenerForDialog(dialog){
        dialog.closedBy="none"; // 크롬대응
        dialog.addEventListener('cancel',(event)=>{event.preventDefault();})  // 사파리 대응. ESC 키 막기
        dialog.addEventListener('close',(event)=>{ 
            const target = event.target
            if(this._resolve){
                if('_returnValue' in target){
                    this._resolve(target._returnValue);
                    delete target._returnValue; // 삭제
                }else{
                    this._resolve(target.returnValue);
                }
            }
            window.document.body.classList.remove('exclusive-dialog-open');
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
    clearQueue() {
        this.queue.length = 0;
    }

    // 이걸 사용안하면 value는 문자열로 처리된다.
    static close(el,val){
        if(!el){return;}
        const dialog = el.closest('dialog');
        if(!dialog){return}
        
        if(typeof val !='string'){ // 문자열이 아닌 경우에만 _returnValue 를 설정해서 사용하며, _returnValue 가 우선 시 된다.
            dialog._returnValue = val; //rawReturnValue
        }
        dialog.close(val);
    }
    
    // 내부 선언된 dialog 기준으로 찾는 것 외엔 static 쪽과 차이가 없다.
    close(el,val){
        if(typeof el === 'string' && this.dialogs[el]){ el = this.dialogs[el]; }
        this.constructor.close(el,val)
    }

    // 열려있는 모든 dialog를 닫는다.
    closeAll(val){
        Object.entries(this.dialogs).forEach(([key, dialog]) => {
            if(dialog.open) this.close(dialog,val); // 열려있으면 닫는다.
        });
    }
    // @deprecated
    closeOpenDialogs(){
        this.closeAll();
    }

    // 예약된 dialog도 포함해서 닫는다. (여러 호출 하였을 때를 위한 처리.)
    clearAndCloseAll(){
        this.clearQueue();
        this.closeAll()
    }
    // @deprecated
    clearAndClose(){
        this.clearAndCloseAll();
    }
}
