import { defineStore } from 'pinia';
import { ref, watchEffect } from 'vue';
import { z } from 'zod';
import klona from 'klona';

const StatusSchema = z.object({
  hp: z.number().default(100),
  mp: z.number().default(50),
  mood: z.string().default('Happy'),
  location: z.string().default('Home')
});

export const useStatusStore = defineStore('status', () => {
  // Let's get variables from 'character' or 'chat'
  // using chat variables as example
  const rawVars = getVariables({ type: 'chat' });
  const statusVars = rawVars?.status ? rawVars.status : {};
  
  const status = ref(StatusSchema.parse(statusVars));
  
  watchEffect(() => {
    updateVariablesWith(vars => {
      vars.status = klona(status.value);
      return vars;
    }, { type: 'chat' });
  });

  return { status };
});