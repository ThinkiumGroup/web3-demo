

export default {
    setItem(key, value) {
        value = JSON.stringify(value);
        localStorage.setItem(key, value);
    },
    getItem(key) {
        try {
            let value = localStorage.getItem(key);
            value = JSON.parse(value);
            return value;
        } catch (err) {
            console.log('-err', err)
            return null;
        }
    },
    removeItem(key){
        localStorage.removeItem(key);
    }
}