import toast from "react-hot-toast";
import Swal from "sweetalert2";

export const notify = {
  success(message: string) {
    return toast.success(message);
  },
  error(message: string) {
    return toast.error(message);
  },
  info(message: string) {
    return toast(message, {
      icon: "i",
    });
  },
  loading(message: string) {
    return toast.loading(message);
  },
  dismiss(toastId?: string) {
    toast.dismiss(toastId);
  },
};

export function confirmDialog({
  title,
  text,
  confirmButtonText,
  cancelButtonText = "Cancel",
}: {
  title: string;
  text: string;
  confirmButtonText: string;
  cancelButtonText?: string;
}) {
  return Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: "#173b72",
    cancelButtonColor: "#c7d2e5",
    background: "#ffffff",
    color: "#173b72",
    reverseButtons: true,
    customClass: {
      popup: "rounded-[24px]",
      confirmButton: "rounded-[12px]",
      cancelButton: "rounded-[12px]",
    },
  });
}
