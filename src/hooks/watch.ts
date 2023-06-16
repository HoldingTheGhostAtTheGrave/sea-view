import { watch } from 'vue';

export const useWatch = (target,callback) => {
    console.log(target);
    
    watch(() => target.value,callback);
}