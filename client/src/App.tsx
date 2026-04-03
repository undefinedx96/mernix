import { useState } from 'react'

const App = () => {

  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>count is {count}</p>
      <button
        className='bg-green-200 px-4 py-2 cursor-pointer'
        onClick={handleClick}
      >+</button>
    </div>
  )
}

export default App