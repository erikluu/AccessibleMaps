import { useState } from 'react'

const INITIAL_STATE = [
  {loc: 'Kennedy Library, San Luis Obispo, CA 93405'},
  {loc: '776 Chorro St, San Luis Obispo, CA 93401'}
]

const Path = props => {
  const [users, setUsers] = useState(INITIAL_STATE)

  const renderUsers = () => {
    return users.map(({loc}) => {
      return <tr key={loc} >
      <td style={{ maxWidth: '19vw', padding: '2%', border: '1px solid black', borderRadius: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc}</td>
    </tr>
    });
  }

  return (
    <div style={{ margin: '5px' }}>
      <h3>Navigation</h3>
      <table>
        <tbody>
            {renderUsers()}
        </tbody>
      </table>
      <form>
        <label htmlFor='loc'></label>
        <input style={{ width: '92.8%', padding: '3%', border: '1px solid black', borderRadius: '8px' }} type='text' placeholder='Add destination'/>
      </form>
    </div>
  );
};

export default Path;