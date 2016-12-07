(function(global) {

    const PENDING = 0,
        RESOLVED = 1,
        REJECTED = 2

    const Promise = function(fun) {

        this.state = PENDING
        this.thenables = []

        if(fun) {
            fun.call(null, this.resolve.bind(this), this.reject.bind(this))
        }
    }

    const fn = Promise.prototype

    fn.then = function(onResolve, onReject) {
        const thenable = {}
        
        if(typeof onResolve === 'function') {
            thenable.onResolve = onResolve
        }
        if(typeof onReject === 'function') {
            thenable.onReject = onReject
        }

        this.thenables.push(thenable)
        thenable.promise = new Promise()

        setTimeout(() => this.dispatch(), 0)

        return thenable.promise
    }

    fn.dispatch = function() {
        if(this.state === PENDING) return

        while(this.thenables.length) {
            const thenable = this.thenables[0]
            const thenPromise = thenable.promise
            let returnVal
            try {
                if(this.state === RESOLVED) {
                    if(thenable.onResolve) {
                        returnVal = thenable.onResolve(this.value)
                    } else {
                        thenPromise.resolve(this.value)
                    }
                }
                if(this.state === REJECTED) {
                    if(thenable.onReject) {
                        returnVal = thenable.onReject(this.value)
                    } else {
                        thenPromise.reject(this.value)
                    }
                }

                if(returnVal && typeof returnVal.then === 'function') {
                    returnVal.then(thenPromise.resolve.bind(thenPromise), thenPromise.reject.bind(thenPromise))
                } else {
                    thenPromise.resolve(returnVal)
                }
            } catch (e) {
                thenPromise.reject(e)
            }
            this.thenables.shift()
        }
    }

    fn.resolve = function(val) {
        if(this.state !== PENDING) return

        this.state = RESOLVED
        this.value = val

        this.dispatch() 
    }

    fn.reject = function(val) {
        if(this.state !== PENDING) return

        this.state = REJECTED
        this.value = val

        this.dispatch()    
    }


    global.PromiseA = Promise
})(window)