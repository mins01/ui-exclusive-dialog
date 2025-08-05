class ModalDialog{
    
    container = null;
    queue = null;
    dialogs = null;
    removeHandlers = null;
    running = false;
    constructor(container){
        this.container = container;
        this.dialogs = {
            alert:this.container.querySelector('.modal-dialog-alert'),
            confirm:this.container.querySelector('.modal-dialog-confirm'),
            prompt:this.container.querySelector('.modal-dialog-prompt'),
        }
        console.log(this.dialogs.alert);
        this.dialogs.alert.addEventListener('cancel',(event)=>{alert('2'); event.preventDefault();})
        if(this.dialogs.alert){ 
            this.dialogs.alert.addEventListener('cancel',(event)=>{event.preventDefault();}) 
            this.dialogs.alert.closedBy="none";
        }
        if(this.dialogs.confirm){ 
            this.dialogs.confirm.closedBy="none";
            this.dialogs.confirm.addEventListener('cancel',(event)=>{event.preventDefault();}) 
        }
        if(this.dialogs.prompt){ 
            this.dialogs.confirm.closedBy="none";
            this.dialogs.prompt.addEventListener('cancel',(event)=>{event.preventDefault();}) 
        }
        this.queue = [];
        this.removeEventHandlers = [];
    }
    
    runRemoveEventHandlers(){
        this.removeEventHandlers.forEach((h)=>{h();})
    }

    alert(message=''){
        const promise = new Promise((resolve,reject)=>{ this.addQueue(()=>{this.showAlert(message,resolve,reject)}) })
        if(!this.running) this.runQueue();
        return promise;
    }
    showAlert(message='',resolve,reject){
        console.log('showAlert',[...arguments]);
        
        this.runRemoveEventHandlers();
        const dialog = this.dialogs.alert
        const messageBox = dialog.querySelector('.modal-dialog-message');
        messageBox.textContent = message;
        
        const btnConfirm = dialog.querySelector('.modal-dialog-btn-confirm');
        if(btnConfirm){
            const fnClick = ()=>{
                if(resolve) resolve();
                dialog.close();
                this.running = false;
                this.runQueue(); // 다음 큐 실행
            };
            btnConfirm.addEventListener('click',fnClick,{once:true})
            this.removeEventHandlers.push(()=>{ btnConfirm.removeEventListener('click',fnClick) }) // 이벤트 제거 등록
        }
        dialog.showModal();
    }
    confirm(message=''){
        const promise = new Promise((resolve,reject)=>{ this.addQueue(()=>{this.showConfirm(message,resolve,reject)}) })
        if(!this.running) this.runQueue();
        return promise;
    }
    showConfirm(message='',resolve,reject){
        console.log('showConfirm',[...arguments]);
        
        this.runRemoveEventHandlers();
        const dialog = this.dialogs.confirm
        const messageBox = dialog.querySelector('.modal-dialog-message');
        messageBox.textContent = message;

        const btnConfirm = dialog.querySelector('.modal-dialog-btn-confirm');
        if(btnConfirm){
            const fnClick = ()=>{
                if(resolve) resolve(true);
                dialog.close();
                this.running = false;
                this.runQueue(); // 다음 큐 실행
            };
            btnConfirm.addEventListener('click',fnClick,{once:true})
            this.removeEventHandlers.push(()=>{ btnConfirm.removeEventListener('click',fnClick) }) // 이벤트 제거 등록
        }

        const btnConcel = dialog.querySelector('.modal-dialog-btn-cancel');
        if(btnConcel){
            const fnClick = ()=>{
                if(resolve) resolve(false);
                dialog.close();
                this.running = false;
                this.runQueue(); // 다음 큐 실행
            };
            btnConcel.addEventListener('click',fnClick,{once:true})
            this.removeEventHandlers.push(()=>{ btnConcel.removeEventListener('click',fnClick) }) // 이벤트 제거 등록
        }
        

        dialog.showModal();
    }
    prompt(message='',defaultValue=''){
        const promise = new Promise((resolve,reject)=>{ this.addQueue(()=>{this.showPrompt(message,defaultValue,resolve,reject)}) })
        if(!this.running) this.runQueue();
        return promise;
    }
    showPrompt(message='',defaultValue='',resolve,reject){
        console.log('showAlert',[...arguments]);
        
        this.runRemoveEventHandlers();
        const dialog = this.dialogs.prompt
        const messageBox = dialog.querySelector('.modal-dialog-message');
        messageBox.textContent = message;
        
        const input = dialog.querySelector('.modal-dialog-input');
        if(input){
            input.defaultValue = defaultValue
            input.value = defaultValue
        }

        const btnConfirm = dialog.querySelector('.modal-dialog-btn-confirm');
        if(btnConfirm){
            const fnClick = ()=>{
                if(resolve) resolve(input?.value);
                dialog.close();
                this.running = false;
                this.runQueue(); // 다음 큐 실행
            };
            btnConfirm.addEventListener('click',fnClick,{once:true})
            this.removeEventHandlers.push(()=>{ btnConfirm.removeEventListener('click',fnClick) }) // 이벤트 제거 등록
        }
        const btnConcel = dialog.querySelector('.modal-dialog-btn-cancel');
        if(btnConcel){
            const fnClick = ()=>{
                if(resolve) resolve();
                dialog.close();
                this.running = false;
                this.runQueue(); // 다음 큐 실행
            };
            btnConcel.addEventListener('click',fnClick,{once:true})
            this.removeEventHandlers.push(()=>{ btnConcel.removeEventListener('click',fnClick) }) // 이벤트 제거 등록
        }
        dialog.showModal();
    }




    addQueue(q){
        this.queue.push(q)
    }
    runQueue(){
        console.log('runQueue',this.queue.length,this.running);
        if(this.running){return}
        if (this.queue.length < 1) { return; }
        this.running = true;
        const q = this.queue.shift();
        return q();
    }
}
