import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { currentModelNameAtom } from '../utils/atoms';
import { MODEL } from '../utils/interfaces';

export default function TopBar() {
  const [models, setModels] = useState<MODEL[]>([]);
  const [currentModelName, setCurrentModelName] = useAtom(currentModelNameAtom);
  const [isModelsDropdownOpen, setIsModelsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    getModels();
  }, []);

  const getModels = async () => {
    // fetch the models from the server
    const response = await fetch('http://localhost:8000/api/tags', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    // set the models
    setModels(data.models);
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
      <div>
        <button
          className="relative w-auto max-w-80 hover:bg-zinc-700 flex justify-center rounded-md transition all px-4"
          onClick={() => setIsModelsDropdownOpen(!isModelsDropdownOpen)}
        >
          {currentModelName}
        </button>
        {renderModelsDropdown()}
      </div>
    );
  };

  return (
    <div className="z-10 absolute top-0 left-0 w-full flex h-[30px] bg-zinc-800 text-white items-center justify-center px-3 shadow-xl">
      {renderModelButton()}
    </div>
  );
}
