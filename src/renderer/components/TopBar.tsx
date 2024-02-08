import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { currentModelNameAtom, isSidebarOpenAtom } from '../utils/atoms';
import { MODEL } from '../utils/interfaces';
import { Menu, RefreshCw } from 'react-feather';
let window: any = global;

export default function TopBar() {

  const [, setIsSidebarOpen] = useAtom(isSidebarOpenAtom);
  const [currentModelName, setCurrentModelName] = useAtom(currentModelNameAtom);

  const [models, setModels] = useState<MODEL[]>([]);
  const [isModelsDropdownOpen, setIsModelsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    getModels();
  }, []);

  const getModels = async () => {
    const addr = window.envVars.OLLAMA_SERVER_ADDRESS || "http://localhost:11434";
    // fetch the models from the server
    const response = await fetch(`${addr}/api/tags`, {
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

    // filter out the current model from the dropdown
    const filteredModels = models.filter((model) => model.name !== currentModelName);

    return (
      <div className="z-10 absolute top-[120%] left-1/2 w-[70%] h-auto bg-zinc-800 text-white items-center justify-end shadow-lg -translate-x-1/2 rounded-md overflow-hidden">
        {filteredModels.map((model, index) => {
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

  const iconStyle = "text-blue-400 cursor-pointer"

  return (
    <div className="z-10 absolute top-0 left-0 w-full h-[30px] bg-zinc-800 flex justify-between items-center px-3">
      <Menu 
        className={iconStyle}
        size={15}
        onClick={() => setIsSidebarOpen(true)}
      />
      <button
        className={`relative h-4/5 w-auto px-5 hover:bg-zinc-700 flex justify-center transition all flex items-center text-white rounded-md`}
        onClick={() => setIsModelsDropdownOpen(!isModelsDropdownOpen)}
      >
        {currentModelName}
      </button>
      <RefreshCw
        className={iconStyle}
        size={15}
        onClick={() => {
          // trigger page refresh
          window.location.reload();
        }}
      />
      {renderModelsDropdown()}
    </div>
  );
}
