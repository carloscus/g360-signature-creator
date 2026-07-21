import { createSignal } from 'solid-js';

export function useLocalStorage<T>(key: string, initialValue: T): [() => T, (value: T | ((prev: T) => T)) => void] {
  const storedValue = (() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  })();

  const [getStoredValue, setStoredValue] = createSignal<T>(storedValue);

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(getStoredValue()) : value;
      setStoredValue(() => valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error al escribir en localStorage key "${key}":`, error);
    }
  };

  return [getStoredValue, setValue];
}

export function useSignatureFormData<T>(initialValue: T): [() => T, (value: T | ((prev: T) => T)) => void, () => void] {
  const STORAGE_KEY = 'signatureFormData';
  
  const [formData, setFormData] = useLocalStorage<T>(STORAGE_KEY, initialValue);

  const clearFormData = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      setFormData(initialValue);
    } catch (error) {
      console.warn('Error al limpiar localStorage:', error);
    }
  };

  return [formData, setFormData, clearFormData];
}