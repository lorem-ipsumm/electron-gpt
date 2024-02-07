import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { currentModelNameAtom } from '../utils/atoms';
import { MODEL } from '../utils/interfaces';
import { OLLAMA_SERVER_ADDRESS } from '../utils/utils';
import { Menu } from 'react-feather';

export default function TopBar() {
  const [models, setModels] = useState<MODEL[]>([]);
  const [currentModelName, setCurrentModelName] = useAtom(currentModelNameAtom);
  const [isModelsDropdownOpen, setIsModelsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    getModels();
  }, []);

  const getModels = async () => {
    // fetch the models from the server
    const response = await fetch(`${OLLAMA_SERVER_ADDRESS}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    // set the models
    setModels(data.models);
    setCurrentModelName(data.models[0].name);
  };

  const renderModelsDropdown = () => {
    if (models.length === 0 || !isModelsDropdownOpen) return null;

    // handle model option clicked
    const modelOptionClicked = (model: MODEL) => {
      // set the current model name
      setCurrentModelName(model.name);
      // close the dropdown
      setIsModelsDropdownOpen(false);
    };

    return (
      <div className="z-10 absolute top-[100%] left-0 w-full h-auto bg-zinc-800 text-white items-center justify-end shadow-lg">
        {models.map((model, index) => {
          return (
            <button
              key={index}
              className="h-[30px] w-full hover:bg-zinc-700 flex items-center justify-center transition all"
              onClick={() => modelOptionClicked(model)}
            >
              {model.name}
            </button>
          );
        })}
      </div>
    );
  };

  const renderModelButton = () => {
    return (
      <>
        <button
          className="relative min-w-full h-full max-w-80 hover:bg-zinc-700 flex justify-center transition all flex items-center"
          onClick={() => setIsModelsDropdownOpen(!isModelsDropdownOpen)}
        >
        <Menu 
          className="absolute left-0 top-1/2 translate-x-2 translate-y-[-50%]"
          size={15}
        />
          {currentModelName}
        </button>
        {renderModelsDropdown()}
      </>
    );
  };

  return (
    <div className="z-10 absolute top-0 left-0 w-full flex h-[30px] bg-zinc-800 text-white items-center justify-center shadow-xl">
      {renderModelButton()}
    </div>
  );
}
