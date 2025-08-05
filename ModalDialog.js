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
        if(this.dialogs.alert){ 
            const dialog = this.dialogs.alert
            dialog.closedBy="none"; // 크롬대응
            dialog.addEventListener('cancel',(event)=>{event.preventDefault();})  // 사파리 대응. ESC 키 막기
            dialog.addEventListener('close',(event)=>{ console.log('close');
                const target = event.target
                this.running = false;
                this.runQueue()
                console.log('returnValue',target.returnValue);
                
                if(target._resolve){
                    target._resolve(target.returnValue);
                }
            })
        }
        if(this.dialogs.confirm){ 
            const dialog = this.dialogs.confirm
            dialog.closedBy="none"; // 크롬대응
            dialog.addEventListener('cancel',(event)=>{event.preventDefault();})  // 사파리 대응. ESC 키 막기
            dialog.addEventListener('close',(event)=>{ console.log('close');
                const target = event.target
                this.running = false;
                this.runQueue()
                console.log('returnValue',target.returnValue);
                if(target._resolve){
                    target._resolve(target.returnValue==='true');
                }
            }) 
        }
        if(this.dialogs.prompt){ 
            const dialog = this.dialogs.prompt
            dialog.closedBy="none"; // 크롬대응
            dialog.addEventListener('cancel',(event)=>{event.preventDefault();})  // 사파리 대응. ESC 키 막기
            dialog.addEventListener('close',(event)=>{ console.log('close');
                const target = event.target
                this.running = false;
                this.runQueue()
                console.log('returnValue',target.returnValue);
                if(target._resolve){
                    if(target.returnValue==='true'){
                        target._resolve(dialog.querySelector('.modal-dialog-input')?.value);
                    }else{
                        target._resolve(null);
                    }
                }
            }) 
        }
        this.queue = [];
        this.removeEventHandlers = [];
    }
    
    runRemoveEventHandlers(){
        this.removeEventHandlers.forEach((h)=>{h();})
    }

    alert(message=''){
        const promise = new Promise((resolve,reject)=>{ this.addQueue(()=>{this.showModal(resolve,reject,this.dialogs.alert,message)}) })
        this.runQueue();
        return promise;
    }
    confirm(message=''){
        const promise = new Promise((resolve,reject)=>{ this.addQueue(()=>{this.showModal(resolve,reject,this.dialogs.confirm,message)}) })
        this.runQueue();
        return promise;
    }
    
    prompt(message='',defaultValue=''){
        const promise = new Promise((resolve,reject)=>{ this.addQueue(()=>{this.showModal(resolve,reject,this.dialogs.prompt,message,defaultValue)}) })
        this.runQueue();
        return promise;
    }
    
    showModal(resolve,reject,dialog,message='',defaultValue=''){
        console.log('showAlert',[...arguments]);
        dialog._resolve = resolve
        dialog._reject = reject
        const messageBox = dialog.querySelector('.modal-dialog-message');
        if(messageBox){ messageBox.textContent = message; }
        const input = dialog.querySelector('.modal-dialog-input');
        if(input){
            input.defaultValue = defaultValue
            input.value = defaultValue
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
