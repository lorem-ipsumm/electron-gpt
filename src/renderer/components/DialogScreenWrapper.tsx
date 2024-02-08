
// this is a wrapper component that will cover the entire screen when a dialog is open
// and close when anything outside of the dialog is clicked
export default function DialogScreenWrapper(props: {
  isDialogOpen: boolean,
  setIsDialogOpen: (isOpen: boolean) => void,
}) {
  if (!props.isDialogOpen) return null;
  return (
    <div 
      className="z-2 absolute left-0 top-0 w-screen h-screen"
      onClick={() => props.setIsDialogOpen(false)}
    /> 
  )
}