/** Helping function used to get all methods of an object */
const getMethods = (obj) => Object.getOwnPropertyNames(obj).filter(item => typeof obj[item] === 'function')

/** Replace the original method with a custom function that will call our aspect when the advice dictates */
function replaceMethod(target, methodName, aspect, advice) {
    const originalCode = target[methodName]
    target[methodName] = (...args) => {
        if(["before", "around"].includes(advice)) {
            aspect.apply(target, args)
        }
        const returnedValue = originalCode.apply(target, args)
        if(["after", "around"].includes(advice)) {
            aspect.apply(target, args)
        }
        if("afterReturning" == advice) {
            return aspect.apply(target, [returnedValue])
        } else {
            return returnedValue
        }
    }
}

module.exports = {
    //Main method exported: inject the aspect on our target when and where we need to
    inject: function(target, aspect, advice, pointcut, method = null) {
        if(pointcut == "method") {
            if(method != null) {
                replaceMethod(target, method, aspect, advice)    
            } else {
                throw new Error("Tryin to add an aspect to a method, but no method specified")
            }
        }
        if(pointcut == "methods") {
            console.log('---methods-target', target);
            const methods = getMethods(target)
            console.log('---methods-inject', methods);
            methods.forEach( m => {
                replaceMethod(target, m, aspect, advice)
            })
        }
    }

    
}