import { useEffect, useState } from 'react';

function useTemplateName(): string {
  const [state, setState] = useState('');

  useEffect(() => {
    setState('Hello World!');
  }, []);

  return state;
}

export default useTemplateName;
