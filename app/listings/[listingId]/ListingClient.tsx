'use client';
import Container from "@/app/components/Container";
import ListingHead from "@/app/components/listings/ListingHead";
import ListingInfo from "@/app/components/listings/ListingInfo";
import ListingReservation from "@/app/components/listings/ListingReservation";
import ListingContact from "@/app/components/listings/ListingContact";
import { categories } from "@/app/components/navbar/Categories";
import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeListing, SafeUser } from "@/app/types";
import { Reservation } from "@prisma/client";
import axios from "axios";
import { differenceInCalendarDays, eachDayOfInterval, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import{Range} from "react-date-range"
import { Account } from "@prisma/client";


const initialDateRange = {
 startDate: new Date(),
 endDate: new Date(),
 key: 'selection'
}


interface ListingClientProps {
 reservations?: Reservation[];
 listing: SafeListing & {
   user: SafeUser;
 };
 currentUser?: SafeUser | null;
 account: Account;
}


const ListingClient: React.FC<ListingClientProps> = ({
 listing,
 reservations = [],
 currentUser,
 account
}) => {
 const  loginModal = useLoginModal();
 const router = useRouter();
 const disableDates = useMemo(() => {
   let dates: Date[] = [];
   reservations.forEach((reservation) => {
     const range = eachDayOfInterval({
       start: new Date(reservation.startDate),
       end: new Date(reservation.endDate),
     });


     dates = [...dates, ...range];
   });
   return dates;


 }, [reservations]);


 const [isLoading, setIsLoading] = useState(false);
 const [totalPrice, setTotalPrice] = useState(listing.price);
 const [dateRange, setDateRange] = useState<Range>(initialDateRange);


 const onCreateReservation = useCallback(async () => {
   if (!currentUser) {
     return loginModal.onOpen();
   }

   setIsLoading(true);
   axios
     .post("/api/reservations", {
       totalPrice,
       startDate: dateRange.startDate,
       endDate: dateRange.endDate,
       listingId: listing?.id,
     })
     .then(() => {
       toast.success("Reservation created successfully");
       setDateRange(initialDateRange);
       router.refresh();
     })
     .catch(()=>{
       toast.error('Something went wrong.');
     })
     .finally(() => {
       setIsLoading(false);
     });
 }, [totalPrice, dateRange, listing?.id, currentUser, loginModal]);

 const onContact = useCallback(async () => {
  if (!currentUser) {
    return loginModal.onOpen();
  }

  setIsLoading(true);

  axios
    .post("/api/reservations", {
      totalPrice,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      listingId: listing?.id,
    })
    .then(() => {
      toast.success("Reservation created successfully");
      setDateRange(initialDateRange);
      router.refresh();
    })
    .catch(()=>{
      toast.success("Contacting Landlord");
    })
    .finally(() => {
      setIsLoading(false);
    });
}, [totalPrice, dateRange, listing?.id, currentUser, loginModal]);


 useEffect(() => {
   if (dateRange.startDate && dateRange.endDate) {
     const dayCount = differenceInCalendarDays(
       dateRange.endDate,
       dateRange.startDate
     );


     if (dayCount && listing.price) {
       setTotalPrice(dayCount * listing.price);
     } else {
       setTotalPrice(listing.price);
     }
   }
 }, [dateRange, listing.price]);




 const category = useMemo(() => {
   return categories.find((item) => item.label === listing.category);
 }, [listing.category]);


 return (
   <Container>
     <div className="max-w-screen-lg mx-auto pt-20">
       <div className="flex flex-col gap-6 ">
         <ListingHead
           title={listing.title}
           imageSrc={listing.imageSrc}
           locationValue={listing.locationValue}
           id={listing.id}
           currentUser={currentUser}
         />
         <div
           className="
           grid
           grid-cols-1
           md:grid-cols-7
           md:gap-10
           mt-6
         "
         > 
           <ListingInfo
             user={listing.user}
             category={category}
             description={listing.description}
             roomCount={listing.roomCount}
             guestCount={listing.guestCount}
             bathroomCount={listing.bathroomCount}
             locationValue={listing.locationValue}
             leaseStartDate={new Date(listing.leaseStartDate)}
             leaseEndDate={new Date(listing.leaseEndDate)}    
             listingLatLong={listing.listingLatLong}

           />
           <div
             className="
               col-span-4              
               order-first
               mb-10
               md:order-last
               md:col-span-3
             "
           >
             <ListingReservation
               price={listing.price}
               totalPrice={totalPrice}
               onChangeDate={(value) => setDateRange(value)}
               dateRange={dateRange}
               onSubmit={onCreateReservation}
               disabled={isLoading}
               disabledDates={disableDates}
             />
             <ListingContact
                email = {listing.user.email}
                onSubmit={onContact}
                user = {listing.user}
                url = "https://mail.google.com/mail/?view=cm&fs=1&to="
             />
           </div>


           <div
             className="
               col-span-4              
               order-first
               mb-10
               md:order-last
               md:col-span-3
             "
           >
            
           </div>
         </div>
       </div>
     </div>
   </Container>
 );
};
export default ListingClient;


