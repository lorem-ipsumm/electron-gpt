import { X } from 'react-feather';
import { SELECTED_IMAGE } from '../utils/interfaces';

type SelectedImagesProps = {
  selectedImages: SELECTED_IMAGE[];
  setSelectedImages: (images: SELECTED_IMAGE[]) => void;
};

export default function SelectedImages({
  selectedImages,
  setSelectedImages,
}: SelectedImagesProps) {
  // ist the image selection hidden or not
  const isHidden = selectedImages.length === 0 ? 'hidden' : 'flex';

  // remove an image from the selected images
  const removeSelectedImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  // render the images passed in
  const renderImagePreviews = () => {
    return selectedImages.map((image, index) => {
      return (
        <div className="w-15 h-15 relative">
          <img
            key={index}
            src={`data:image/jpeg;base64,${image.base64}`}
            alt="selected image"
            className="w-full h-full object-cover rounded-md"
          />
          <div className="absolute top-0 right-0 m-[5px] cursor-pointer shadow-lg bg-zinc-900 rounded-full w-4 h-4 flex items-center justify-center">
            <X
              onClick={() => removeSelectedImage(index)}
              size={10}
              className="text-white"
            />
          </div>
        </div>
      );
    });
  };

  return (
    <div className={`${isHidden} h-20 bg-zinc-800 mb-3 rounded-md p-2 gap-2`}>
      {renderImagePreviews()}
    </div>
  );
}
