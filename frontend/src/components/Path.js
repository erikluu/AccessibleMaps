import { useMemo, useState } from 'react';
import MaterialReactTable from 'material-react-table';

const INITIAL_STATE = [
  {loc: '', id: 1},
  {loc: '', id: 2}
]

const Path = props => {
  const [stops, setStops] = useState(INITIAL_STATE)

  const addStop = () => {
    const data = {
      loc: '',
      id: stops[stops.length - 1].id + 1
    };
    setStops([...stops, data]);
  };

  // const renderUsers = () => {
  //   return users.map(({loc}) => {
  //     return <tr key={loc} className="geocoder_tr" >
  //     <td style={{ maxWidth: '19vw', padding: '2%', border: '1px solid black', borderRadius: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc}</td>
  //   </tr>
  //   });
  // }

  const renderUsers = () => {
    return stops.map(s => {
      return <tr key={s.loc} >
        <td className="geocoder_td"></td>
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
      <button onClick={addStop}>Add Destination</button>
    </div>
  );
};

export default Path;