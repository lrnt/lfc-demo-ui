import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql
} from "@apollo/client";
import { formatEther } from 'ethers/lib/utils';
import { useState } from "react";

const GET_ROOMS = gql`
  query GetRooms {
    rooms (where: {id_in: ["0x3dc0d29f8e485a6b4ac28ec3c64a994624112dbf", "0x4aaa233f6b5e4a8c937d7eb0c6bae64117587915", "0xf60728ce4434f1ce0a3beaa1e0e45714931a4721"]}) {
      id
      uri
    }
  }
`

const GET_PROPOSALS = gql`
  query GetProposals($room: String!) {
    proposals(where: {room: $room}) {
      id
      amount
      uri
      status
      room {
        uri
        id
      }
    }
  allProposals: proposals {
      id
      amount
      uri
      status
      room {
        uri
        id
      }
    }
  } `;

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/id/QmUzyoEHUwSs7nu8F9faxFcVcgxA74TbVDohmP1DnKhahM',
  cache: new InMemoryCache()
});

const RoomSelector = ({ onRoomChanged }) => {
  const { error, data } = useQuery(GET_ROOMS)

  return (
    <select className="block bg-gray-700 text-gray-100 w-2/3 text-base rounded-md" onChange={event => onRoomChanged(event?.target?.value)}>
      <option value="">---</option>
      {data?.rooms.map(room => <option key={room.id} value={room.id}>{room.uri}</option>)}
    </select>
  )
}

const ProposalList = ({ room }) => {
  const { loading, error, data } = useQuery(GET_PROPOSALS, { variables: { room: room || '' } });

  const proposals = room ? data?.proposals : data?.allProposals

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      {loading && "loading..."}
      {proposals?.map(proposal => (
        <div key={proposal.id} className="bg-gray-700 p-4 rounded rounded-lg flex justify-between w-2/3">
          <div className="text-xl">
            {formatEther(proposal.amount)} MATIC
          </div>
          <div>
            {proposal.id} - {proposal.status}
          </div>
        </div>
      ))}
    </div>
  )
}

function App() {
  const [room, setRoom] = useState('')

  return (
    <ApolloProvider client={client}>
      <div className="bg-gray-900 h-screen w-full flex flex-col items-center gap-4 text-gray-100 p-4">
        <RoomSelector onRoomChanged={setRoom} />
        <ProposalList room={room} />
      </div>
    </ApolloProvider>
  );
}

export default App;
