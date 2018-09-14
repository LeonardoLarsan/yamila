let yamila = {}
yamila.dom = document.querySelector('#app')
yamila.start = function(){
    this.store.updateDOM(this.store.state,{})
}
yamila.store = {
    state:{},
    actions:{},
    mutators:{},
    services:{},
    getters:{},
    async dispatch(key, param){
        let oldState = JSON.parse(JSON.stringify(this.state))
        await this.actions[key](this, param)
        this.updateDOM(this.state, oldState)  
    },
    updateDOM(newState, oldState){
        for(let i = 0 ; i < yamila.dom.children.length ; i++){
            yamila.dom.children[i].update(newState, oldState)
        }
    },
    commit(key, param){
        this.mutators[key](this.state, param)
    },
    consume(key, param){
        return this.services[key](param)
    },
    create({state = {}, actions ={}, mutators={}, services={}}){
        this.state = state
        this.actions = actions
        this.mutators = mutators
        this.services = services
    }
}

yamila.yamilaView = {
    createContainer(){
        let container = document.createElement('div')
        container.updateChildren = function(newData, oldData){
            for( let i = 0 ; i < this.children.length ; i++){
                this.children[i].update(newData, oldData)
            }
        }
        container.update = function(newData, oldData){}
        return container
    },
    createList(){
        let container = document.createElement('div')
        container.updateChildren = function(newDataList, oldDataList){
            newDataList.map((item, index) => {
                !this.children[index] && this.appendChild(this.createChild(item))
                this.children[index].update(item)
            })
            this.deleteItems(newDataList)
        }
        container.deleteItems = function(dataList){
            if(dataList.length < this.children.length ){
                let numBucles =  this.children.length - dataList.length
                for( i = 0 ; i < numBucles ; i++ ){
                    this.removeChild(this.children[dataList.length])
                }
            }
        }
        container.createChild = function(data){}
        container.update = function(store){}
        return container
    },
    createLabel(){
        let element = document.createElement('div')
        element.update = function(data){}
        return element
    },
    createInput(){
        let input = document.createElement('input')
        input.update = function(data){}
        input.onchange = function(event){}
        return input
    },
    createButton(){
        let button = document.createElement('button')
        button.update = function(data){}
        button.onclick = function(event){}
        return button
    },
    createView(){
        let view = document.createElement('div')
        view.update = function(store){}
        view.show = function(){
            this.style.display = 'block'
        }
        view.hide = function(){
            this.style.display = 'none'
        }
        view.updateChildren = function(newData, oldData){
            for( let i = 0 ; i < this.children.length ; i++){
                this.children[i].update(newData, oldData)
            }
        }
        return view
    }
}

yamila.createComponent = function (params) {
    let element = null
    if (params.type === 'container') {
        element = yamila.yamilaView.createContainer()
        params.childs && params.childs.map(child => {
            element.appendChild(child)
        })
    } else if (params.type === 'list') {
        element = yamila.yamilaView.createList()
        params.child && ( element.createChild = params.child ) 
    } else if (params.type === 'label') {
        element = yamila.yamilaView.createLabel()
    } else if (params.type === 'input') {
        element = yamila.yamilaView.createInput()
        element.oninput = function (e) { params.handler(e.target.value) }
    } else if (params.type === 'button') {
        element = yamila.yamilaView.createButton()
        element.onclick = params.handler
    } else if (params.type === 'view') {
        element = yamila.yamilaView.createView()
        params.childs && params.childs.map(child => {
            element.appendChild(child)
        })
    }
    element.update = params.update
    params.create && params.create.bind(element)()
    params.onClick && (element.onclick = params.onClick) 
    params.className && ( element.className = params.className )
    return element
}