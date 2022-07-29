import { useContractKit } from "@celo-tools/use-contractkit";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import AddNfts from "./Add";
import Nft from "./Card";
import Loader from "../../ui/Loader";
import { NotificationSuccess, NotificationError } from "../../ui/Notifications";
import {
  adoptAnimal,
  releaseAnimal,
  getAnimals,
  addAnimal,
  fetchNftContractOwner,
} from "../../../utils/minter";
import { Row } from "react-bootstrap";

const NftList = ({ minterContract, name }) => {

  /* performActions : used to run smart contract interactions in order
  *  address : fetch the address of the connected wallet
  */
  const { performActions, address, kit } = useContractKit();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nftOwner, setNftOwner] = useState(null);

  const { defaultAccount } = kit;


  const getAssets = useCallback(async () => {
    try {
      setLoading(true);

      // fetch all nfts from the smart contract
      const allAnimals = await getAnimals(minterContract);
      if (!allAnimals) return
      setAnimals(allAnimals);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [minterContract]);

  const addNft = async (data) => {
    try {
      setLoading(true);

      // create an nft functionality
      await addAnimal(minterContract, performActions, data);
      toast(<NotificationSuccess text="Updating Your Animal list...." />);
      getAssets();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create an NFT." />);
    } finally {
      setLoading(false);
    }
  };

  const adopt = async (index) => {
    try {
      setLoading(true);
      await adoptAnimal(minterContract, index, performActions);
      getAssets();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const release = async (index) => {
    try {
      setLoading(true);
      await releaseAnimal(minterContract, index, performActions);
      getAssets();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const fetchContractOwner = useCallback(async (minterContract) => {

    // get the address that deployed the NFT contract
    const _address = await fetchNftContractOwner(minterContract);
    setNftOwner(_address);
  }, []);

  useEffect(() => {
    try {
      if (address && minterContract) {
        getAssets();
        fetchContractOwner(minterContract);
      }
    } catch (error) {
      console.log({ error });
    }
  }, [minterContract, address, getAssets, fetchContractOwner]);
  if (address) {
    return (
      <>
        {!loading ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="fs-4 fw-bold mb-0">{name}</h1>

              {/* give the add NFT permission to user who deployed the NFT smart contract */}
              {nftOwner === address ? (
                <AddNfts save={addNft} address={address} />
              ) : null}

            </div>
            <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5">

              {/* display all NFTs */}
              {animals.map((_nft) => (
                <Nft
                  key={_nft.index}
                  adoptAnimal={()=>adopt(_nft.index)}
                  releaseAnimal={()=>release(_nft.index)}
                  contractOwner={defaultAccount}
                  nft={{
                    ..._nft,
                  }}
                />
              ))}
            </Row>
          </>
        ) : (
          <Loader />
        )}
      </>
    );
  }
  return null;
};

NftList.propTypes = {

  // props passed into this component
  minterContract: PropTypes.instanceOf(Object),
  updateBalance: PropTypes.func.isRequired,
};

NftList.defaultProps = {
  minterContract: null,
};

export default NftList;
